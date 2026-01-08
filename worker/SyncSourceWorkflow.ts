import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { createDb } from "./db";
import { AwsClient } from "aws4fetch";
import {
  parseErrorResponse,
  parseListObjectsV2Response,
  parseS3Date,
} from "./s3-response-parsers";
import { streamToAsyncIterator } from "./util";
import { ObjectRow } from "./db-types";
import { Insertable } from "kysely";

type Params = {
  sourceId: number;
  continuationToken: string | undefined;
  syncDate: Date | undefined;
};

// TODO: reduce concurrency to one
export class SyncSourceWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const sourceId = event.payload.sourceId;
    let continuationToken: undefined | string = event.payload.continuationToken;
    const syncDate = event.payload.syncDate || event.timestamp;

    const db = createDb(this.env.db);
    const source = await step.do("get source from db", async () => {
      return db
        .selectFrom("sources")
        .selectAll()
        .where("id", "=", sourceId)
        .executeTakeFirstOrThrow();
    });

    // 50 subrequests limit applies to d1 requests
    // - 1 for source
    // - 1 per batch / step

    // there are actually 1024 max steps (https://developers.cloudflare.com/workflows/reference/limits/)
    //   but since each step makes 1 subrequest (db call), we can't do more than 49 steps
    //   ...but there's also the stale object handling at the end...
    const MAX_STEPS = 35;
    let stepIndex = 0;

    do {
      const result = await step.do(
        `process objects - ${stepIndex}`,
        async () => {
          const values: Insertable<ObjectRow>[] = [];
          let nextContinuationToken: undefined | string = undefined;
          const MAX_PAGES = 10;
          for (let page = 0; page < MAX_PAGES; page += 1) {
            const data = await listObjects(source, continuationToken);
            nextContinuationToken = data.NextContinuationToken;
            for (const { Key, ETag, LastModified } of data.Contents) {
              // TODO: we're missing a way to be able to reset
              values.push({
                key: Key,
                hash: ETag,
                source_id: sourceId,
                date_synced: syncDate.getTime() / 1000,
                date_created: parseS3Date(LastModified).getTime() / 1000,
              });
            }
          }
          await db
            .insertInto("objects")
            .values(values)
            .onConflict((oc) =>
              // if we're trying to insert an object that already has this key,
              //  change the insert to update with these keys
              // this would happen on any existing object, so it's unclear if this
              //   is just updating the date_synced or if it's updating the hash
              oc.column("key").doUpdateSet((eb) => ({
                hash: eb.ref("excluded.hash"),
                source_id: eb.ref("excluded.source_id"),
                date_synced: eb.ref("excluded.date_synced"),
                date_created: eb.ref("excluded.date_created"),
              })),
            )
            .execute();
          return { continuationToken: nextContinuationToken };
        },
      );
      stepIndex += 1;
      continuationToken = result.continuationToken;
    } while (continuationToken && stepIndex < MAX_STEPS);

    if (continuationToken) {
      const workflow: Workflow<Params> = this.env.SyncSourceWorkflow;
      await workflow.create({
        params: {
          continuationToken,
          sourceId,
          syncDate,
        },
      });
      return; // the subsequent workflow will finish the job
    }

    // Handle stale objects (not found in current sync)
    await step.do("handle stale objects", async () => {
      const syncTimestamp = syncDate.getTime() / 1000;

      // Clear existing pending rename candidates for this source - we'll rebuild from current state
      await db
        .deleteFrom("pending_rename_candidates")
        .where("source_id", "=", sourceId)
        .execute();

      // QUERY 1: Get stale objects with their candidate counts (single query)
      // This joins stale objects with new objects by hash to find candidates
      const staleWithCandidates = await db
        .selectFrom("objects as stale")
        .leftJoin("objects as candidate", (join) =>
          join
            .onRef("stale.hash", "=", "candidate.hash")
            .on("candidate.source_id", "=", sourceId)
            .on("candidate.date_synced", "=", syncTimestamp),
        )
        .select([
          "stale.id as stale_id",
          "stale.hash as stale_hash",
          "candidate.id as candidate_id",
          "candidate.key as candidate_key",
          "candidate.date_created as candidate_date_created",
          "candidate.hash as candidate_hash",
        ])
        .where("stale.source_id", "=", sourceId)
        .where("stale.date_synced", "!=", syncTimestamp)
        .execute();

      // Group by stale object
      type Candidate = {
        id: number;
        key: string;
        dateCreated: number;
        hash: string;
      };
      const staleMap = new Map<
        number,
        { hash: string | null; candidates: Candidate[] }
      >();
      for (const row of staleWithCandidates) {
        if (!staleMap.has(row.stale_id)) {
          staleMap.set(row.stale_id, { hash: row.stale_hash, candidates: [] });
        }
        if (row.candidate_id != null) {
          staleMap.get(row.stale_id)!.candidates.push({
            id: row.candidate_id,
            key: row.candidate_key!,
            dateCreated: row.candidate_date_created!,
            hash: row.candidate_hash!,
          });
        }
      }

      // Categorize
      const toDelete: number[] = [];
      const toRename: {
        staleId: number;
        candidateId: number;
        newKey: string;
        newDateCreated: number;
        newHash: string;
      }[] = [];
      const toPending: { staleId: number; candidateIds: number[] }[] = [];

      for (const [staleId, { hash, candidates }] of staleMap) {
        if (!hash || candidates.length === 0) {
          toDelete.push(staleId);
        } else if (candidates.length === 1) {
          const c = candidates[0];
          toRename.push({
            staleId,
            candidateId: c.id,
            newKey: c.key,
            newDateCreated: c.dateCreated,
            newHash: c.hash,
          });
        } else {
          toPending.push({
            staleId,
            candidateIds: candidates.map((c) => c.id),
          });
        }
      }

      // QUERY 2: Bulk delete objects with no candidates
      if (toDelete.length > 0) {
        await db.deleteFrom("objects").where("id", "in", toDelete).execute();
      }

      // QUERY 3: Handle renames (update stale objects with new keys, delete candidates)
      if (toRename.length > 0) {
        // Delete the candidate objects first
        await db
          .deleteFrom("objects")
          .where(
            "id",
            "in",
            toRename.map((r) => r.candidateId),
          )
          .execute();

        // Bulk upsert stale objects with new keys using INSERT ON CONFLICT
        await db
          .insertInto("objects")
          .values(
            toRename.map((r) => ({
              id: r.staleId,
              key: r.newKey,
              source_id: sourceId,
              date_synced: syncTimestamp,
              date_created: r.newDateCreated,
              hash: r.newHash,
            })),
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              key: eb.ref("excluded.key"),
              date_synced: eb.ref("excluded.date_synced"),
              date_created: eb.ref("excluded.date_created"),
              hash: eb.ref("excluded.hash"),
            })),
          )
          .execute();
      }

      // QUERY 4: Insert pending rename candidates
      if (toPending.length > 0) {
        const candidateRows: {
          object_id: number;
          candidate_id: number;
          source_id: number;
          created_at: number;
        }[] = [];
        for (const p of toPending) {
          for (const candidateId of p.candidateIds) {
            candidateRows.push({
              object_id: p.staleId,
              candidate_id: candidateId,
              source_id: sourceId,
              created_at: syncTimestamp,
            });
          }
        }
        await db
          .insertInto("pending_rename_candidates")
          .values(candidateRows)
          .execute();
      }
    });

    // Update source's date_synced
    await step.do("update source date_synced", async () => {
      await db
        .updateTable("sources")
        .set({ date_synced: syncDate.getTime() / 1000 })
        .where("id", "=", sourceId)
        .execute();
    });
  }
}

async function listObjects(
  source: {
    s3_api_key: string;
    s3_api_key_secret: string;
    s3_region: string;
    s3_endpoint: string;
    s3_bucket: string;
  },
  continuationToken: string | undefined,
) {
  const aws = new AwsClient({
    accessKeyId: source.s3_api_key,
    secretAccessKey: source.s3_api_key_secret,
    region: source.s3_region,
    service: "s3",
  });
  // GET /?list-type=2&continuation-token=ContinuationToken&delimiter=Delimiter&encoding-type=EncodingType&fetch-owner=FetchOwner&max-keys=MaxKeys&prefix=Prefix&start-after=StartAfter HTTP/1.1
  const url = new URL(`https://${source.s3_endpoint}/${source.s3_bucket}/`);
  url.searchParams.set("list-type", "2");
  if (continuationToken) {
    url.searchParams.set("continuation-token", continuationToken);
  }
  const response = await aws.fetch(url);
  let text = "";
  if (response.body) {
    for await (const chunk of streamToAsyncIterator(response.body)) {
      text += chunk;
    }
  }
  if (!response.ok) {
    if (text) {
      const { Code, Message, ...rest } = parseErrorResponse(text);
      throw new Error(
        `${url.toString()} failed with status ${response.status} - (Code ${Code}): ${Message}\n${JSON.stringify(rest, null, 2)}`,
      );
    }
    throw new Error(
      `${url.toString()} failed with status ${response.status} - no body`,
    );
  }
  if (!text) {
    throw new Error(`${url.toString()} failed by not having any text?`);
  }
  return parseListObjectsV2Response(text);
}
