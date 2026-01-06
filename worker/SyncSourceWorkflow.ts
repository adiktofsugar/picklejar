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
              }))
            )
            .execute();
          return { continuationToken: nextContinuationToken };
        }
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
    // we're done! now we just need to handle the stale objects...
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
  continuationToken: string | undefined
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
        `${url.toString()} failed with status ${response.status} - (Code ${Code}): ${Message}\n${JSON.stringify(rest, null, 2)}`
      );
    }
    throw new Error(
      `${url.toString()} failed with status ${response.status} - no body`
    );
  }
  if (!text) {
    throw new Error(`${url.toString()} failed by not having any text?`);
  }
  return parseListObjectsV2Response(text);
}
