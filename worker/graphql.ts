import { createSchema, createYoga } from "graphql-yoga";
import type { Kysely } from "kysely";
import type { PhotoEdge, Resolvers } from "./generated/graphql-resolvers";
import typeDefs from "../schema.graphqls?raw";
import { GraphQLError } from "graphql";
import { DbCursor } from "./DbCursor";
import { encryptPhotoToken } from "./crypto";
import { DB } from "./db-types";

export interface GraphQLContext {
  db: Kysely<DB>;
  encryptionKey: string;
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

      // Join objects with sources to get all data needed for tokens
      // Left join photos to get lat/lng
      // Filter to only show objects that have been synced (date_synced matches source)
      let query = db
        .selectFrom("objects as o")
        .innerJoin("sources as s", "o.source_id", "s.id")
        .leftJoin("photos as p", "o.hash", "p.object_hash")
        .selectAll("o")
        .selectAll("s")
        .select(["p.lat", "p.lng"])
        .select("o.id as object_id") // id is for sources since it's second
        .whereRef("o.date_synced", "=", "s.date_synced")
        .orderBy("o.date_created", "desc")
        .limit(limit + 1);

      if (cursor) {
        query = query.where((eb) =>
          eb.or([
            // older than the cursor object
            eb("o.date_created", "<", cursor.dateCreated),
            // or the same date, but created after (id is auto increment)
            eb.and([
              eb("o.date_created", "=", cursor.dateCreated),
              eb("o.id", "<", cursor.id),
            ]),
          ]),
        );
      }

      const results = await query.execute();
      const hasNextPage = results.length > limit;

      return {
        results: results.slice(0, limit),
        hasNextPage,
      };
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
  Photo: {
    id: (p) => p.id,
    token: (p) => p.token,
    date_created: (p) => p.date_created,
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
              id: String(row.object_id),
              token,
              date_created: row.date_created,
              lat: row.lat,
              lng: row.lng,
            },
            cursor: new DbCursor(row.object_id, row.date_created).encode(),
          } satisfies PhotoEdge;
        }),
      );
    },
    pageInfo: (p) => {
      const last = p.results.at(-1);
      return {
        hasNextPage: p.hasNextPage,
        endCursor: last
          ? new DbCursor(last.object_id, last.date_created).encode()
          : null,
      };
    },
  },
};

export function createGraphQLHandler(
  db: Kysely<DB>,
  encryptionKey: string,
  graphqlEndpoint: string,
) {
  return createYoga<GraphQLContext>({
    schema: createSchema({ typeDefs, resolvers }),
    context: { db, encryptionKey },
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
