import { createSchema, createYoga } from "graphql-yoga";
import type { Kysely } from "kysely";
import type { PhotoEdge, Resolvers } from "./generated/graphql-resolvers";
import typeDefs from "../schema.graphqls?raw";
import { GraphQLError } from "graphql";
import { DbCursor } from "./DbCursor";
import { encryptPhotoToken } from "./crypto";
import { DB, PhotoConnectionResult, PhotoErrorResult } from "./db-types";

type SyncSourceParams = {
  sourceId: number;
  continuationToken: string | undefined;
  syncDate: Date | undefined;
};

export interface GraphQLContext {
  db: Kysely<DB>;
  encryptionKey: string;
  syncSourceWorkflow: Workflow<SyncSourceParams>;
}

export const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    sources: async (_parent, _args, { db }) => {
      const results = await db.selectFrom("sources").selectAll().execute();
      return results;
    },
    source: async (_parent, { id }, { db }) => {
      const result = await db
        .selectFrom("sources")
        .selectAll()
        .where("id", "=", Number(id))
        .executeTakeFirst();
      if (!result) {
        throw new GraphQLError(`Could not find source with id: ${id}`);
      }
      return result;
    },
    photos: async (_parent, { cursor: cursorEncoded, first }, { db }) => {
      const cursor = cursorEncoded ? DbCursor.decode(cursorEncoded) : null;
      const limit = first || 100;

      // Query from photos table, join objects and sources
      // Only show successfully processed photos (no errors, has dimensions)
      let query = db
        .selectFrom("photos as p")
        .innerJoin("objects as o", "p.object_id", "o.id")
        .innerJoin("sources as s", "o.source_id", "s.id")
        .select([
          "p.id",
          "p.width",
          "p.height",
          "p.lat",
          "p.lng",
          "p.date_taken",
          "o.id as object_id",
          "o.key",
          "o.date_created",
          "o.source_id",
          "s.s3_endpoint",
          "s.s3_region",
          "s.s3_bucket",
          "s.s3_api_key",
          "s.s3_api_key_secret",
        ])
        .whereRef("o.date_synced", "=", "s.date_synced")
        .where("p.processing_error", "is", null)
        .where("p.width", "is not", null)
        .orderBy("o.date_created", "desc")
        .limit(limit + 1);

      if (cursor) {
        query = query.where((eb) =>
          eb.or([
            // older than the cursor object
            eb("o.date_created", "<", cursor.dateCreated),
            // or the same date, but with smaller photo id
            eb.and([
              eb("o.date_created", "=", cursor.dateCreated),
              eb("p.id", "<", cursor.id),
            ]),
          ]),
        );
      }

      const results = await query.execute();
      const hasNextPage = results.length > limit;

      // Get error count separately
      const errorCountResult = await db
        .selectFrom("photos as p")
        .innerJoin("objects as o", "p.object_id", "o.id")
        .innerJoin("sources as s", "o.source_id", "s.id")
        .select(({ fn }) => fn.countAll<number>().as("count"))
        .whereRef("o.date_synced", "=", "s.date_synced")
        .where("p.processing_error", "is not", null)
        .executeTakeFirst();

      // Cast results - we know these fields are non-null due to WHERE clauses
      return {
        results: results.slice(0, limit) as PhotoConnectionResult[],
        hasNextPage,
        errorCount: errorCountResult?.count ?? 0,
      };
    },
    photosErrors: async (_parent, { cursor: cursorEncoded, first }, { db }) => {
      const cursor = cursorEncoded ? DbCursor.decode(cursorEncoded) : null;
      const limit = first || 100;

      // Query photos with errors
      let query = db
        .selectFrom("photos as p")
        .innerJoin("objects as o", "p.object_id", "o.id")
        .innerJoin("sources as s", "o.source_id", "s.id")
        .select(["p.id", "p.object_id", "o.key", "p.processing_error"])
        .whereRef("o.date_synced", "=", "s.date_synced")
        .where("p.processing_error", "is not", null)
        .orderBy("p.id", "desc")
        .limit(limit + 1);

      if (cursor) {
        query = query.where("p.id", "<", cursor.id);
      }

      const results = await query.execute();
      const hasNextPage = results.length > limit;

      // Cast results - we know processing_error is non-null due to WHERE clause
      return {
        results: results.slice(0, limit) as PhotoErrorResult[],
        hasNextPage,
      };
    },
    syncStatus: async (_parent, { workflowId }, { syncSourceWorkflow }) => {
      try {
        const instance = await syncSourceWorkflow.get(workflowId);
        const statusResult = await instance.status();
        return {
          status: statusResult.status,
          error: statusResult.error ? JSON.stringify(statusResult.error) : null,
        };
      } catch (error) {
        // If workflow not found or other error, return unknown status
        return {
          status: "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },
  Mutation: {
    createS3Source: async (_parent, { input }, { db }) => {
      const result = await db
        .insertInto("sources")
        .values({
          name: input.name,
          kind: "S3",
          s3_endpoint: input.s3_endpoint,
          s3_region: input.s3_region,
          s3_bucket: input.s3_bucket,
          s3_api_key: input.s3_api_key,
          s3_api_key_secret: input.s3_api_key_secret,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return result;
    },
    updateS3Source: async (_parent, { input }, { db }) => {
      const result = await db
        .updateTable("sources")
        .set({
          ...(input.name != null && { name: input.name }),
          ...(input.s3_endpoint != null && { s3_endpoint: input.s3_endpoint }),
          ...(input.s3_region != null && { s3_region: input.s3_region }),
          ...(input.s3_bucket != null && { s3_bucket: input.s3_bucket }),
          ...(input.s3_api_key != null && { s3_api_key: input.s3_api_key }),
          ...(input.s3_api_key_secret != null && {
            s3_api_key_secret: input.s3_api_key_secret,
          }),
        })
        .where("id", "=", Number(input.id))
        .returningAll()
        .executeTakeFirst();

      if (!result) {
        throw new GraphQLError(`Source with id ${input.id} not found`);
      }

      return result;
    },
    deleteS3Source: async (_parent, { input }, { db }) => {
      const result = await db
        .deleteFrom("sources")
        .where("id", "=", Number(input.id))
        .returningAll()
        .executeTakeFirst();

      if (!result) {
        throw new GraphQLError(`Source with id ${input.id} not found`);
      }

      return result;
    },
    syncSource: async (_parent, { input }, { db, syncSourceWorkflow }) => {
      const instance = await syncSourceWorkflow.create({
        params: {
          sourceId: Number(input.id),
          continuationToken: undefined,
          syncDate: undefined,
        },
      });

      // Store the workflow ID in the source
      await db
        .updateTable("sources")
        .set({ sync_workflow_id: instance.id })
        .where("id", "=", Number(input.id))
        .execute();

      return instance.id;
    },
  },
  Source: {
    __resolveType: async (parent) => {
      // I will theoretically have more than one kind in the future
      if (parent.kind === "S3") {
        return "S3Source" as const;
      }
      throw new GraphQLError(
        `Can not determing type name of source with kind ${parent.kind}`,
      );
    },
  },
  // Required because I customized S3Source to return a custom object that has int ids
  S3Source: {
    id: (p) => String(p.id),
    name: (p) => p.name,
    sync_workflow_id: (p) => p.sync_workflow_id,
    s3_endpoint: (p) => p.s3_endpoint,
    s3_region: (p) => p.s3_region,
    s3_bucket: (p) => p.s3_bucket,
    s3_api_key: (p) => p.s3_api_key,
    s3_api_key_secret: (p) => p.s3_api_key_secret,
  },
  PageInfo: {
    endCursor: (p) => p.endCursor,
    hasNextPage: (p) => p.hasNextPage,
  },
  SyncStatus: {
    status: (p) => p.status,
    error: (p) => p.error,
  },
  Photo: {
    id: (p) => p.id,
    token: (p) => p.token,
    date_created: (p) => p.date_created,
    width: (p) => p.width,
    height: (p) => p.height,
    lat: (p) => p.lat,
    lng: (p) => p.lng,
  },
  PhotoEdge: {
    cursor: (p) => p.cursor,
    node: (p) => p.node,
  },
  PhotoConnection: {
    edges: async (p, _args, { encryptionKey }) => {
      return Promise.all(
        p.results.map(async (row) => {
          const token = await encryptPhotoToken(
            {
              sourceId: row.source_id,
              key: row.key,
              s3Endpoint: row.s3_endpoint,
              s3Region: row.s3_region,
              s3Bucket: row.s3_bucket,
              s3ApiKey: row.s3_api_key,
              s3ApiKeySecret: row.s3_api_key_secret,
            },
            encryptionKey,
          );

          return {
            node: {
              id: String(row.id), // Use photo.id
              token,
              date_created: row.date_created,
              width: row.width!,
              height: row.height!,
              lat: row.lat,
              lng: row.lng,
            },
            cursor: new DbCursor(row.id, row.date_created).encode(),
          } satisfies PhotoEdge;
        }),
      );
    },
    pageInfo: (p) => {
      const last = p.results.at(-1);
      return {
        hasNextPage: p.hasNextPage,
        endCursor: last
          ? new DbCursor(last.id, last.date_created).encode()
          : null,
      };
    },
    errorCount: (p) => p.errorCount,
  },
  PhotoError: {
    id: (p) => String(p.id),
    objectKey: (p) => p.key,
    error: (p) => p.processing_error,
  },
  PhotoErrorEdge: {
    cursor: (p) => p.cursor,
    node: (p) => p.node,
  },
  PhotoErrorConnection: {
    edges: (p) => {
      return p.results.map((row) => ({
        node: row, // Pass raw result to PhotoError resolver
        cursor: new DbCursor(row.id, 0).encode(),
      }));
    },
    pageInfo: (p) => {
      const last = p.results.at(-1);
      return {
        hasNextPage: p.hasNextPage,
        endCursor: last ? new DbCursor(last.id, 0).encode() : null,
      };
    },
  },
};

export function createGraphQLHandler(
  db: Kysely<DB>,
  encryptionKey: string,
  syncSourceWorkflow: Workflow<SyncSourceParams>,
  graphqlEndpoint: string,
) {
  return createYoga<GraphQLContext>({
    schema: createSchema({ typeDefs, resolvers }),
    context: { db, encryptionKey, syncSourceWorkflow },
    graphqlEndpoint,
    fetchAPI: {
      Response,
      Blob,
      btoa,
      CompressionStream,
      crypto,
      DecompressionStream,
      fetch,
      File,
      FormData,
      Headers,
      ReadableStream,
      Request,
      TextDecoder,
      TextDecoderStream,
      TextEncoder,
      TextEncoderStream,
      TransformStream,
      URL,
      URLPattern,
      URLSearchParams,
      WritableStream,
    },
  });
}
