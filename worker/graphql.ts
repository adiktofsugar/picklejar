import { createSchema, createYoga } from "graphql-yoga";
import type { PhotoEdge, Resolvers } from "./generated/graphql-resolvers";
import type { SourceRow, ObjectRow, SourceRowResolver } from "./db-types";
import typeDefs from "../schema.graphqls?raw";
import { GraphQLError } from "graphql";
import { DbCursor } from "./DbCursor";
import { encryptPhotoToken } from "./crypto";

export interface GraphQLContext {
  db: D1Database;
  encryptionKey: string;
}

function toSourceResolver(row: SourceRow): SourceRowResolver {
  return { ...row, id: String(row.id) };
}

export const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    sources: async (_parent, _args, context) => {
      const result = await context.db
        .prepare("SELECT * FROM sources")
        .all<SourceRow>();
      return result.results.map(toSourceResolver);
    },
    source: async (_parent, { id }, context) => {
      const result = await context.db
        .prepare("SELECT * FROM sources WHERE id = ?")
        .bind(id)
        .first<SourceRow>();
      if (!result) {
        throw new GraphQLError(`Could not find source with id: ${id}`);
      }
      return toSourceResolver(result);
    },
    photos: async (
      _parent,
      { cursor: cursorEncoded, first },
      { db, encryptionKey },
    ) => {
      const cursor = cursorEncoded ? DbCursor.decode(cursorEncoded) : null;
      const limit = first || 100;

      // Join photos with sources to get all data needed for tokens
      let query: D1PreparedStatement;
      if (cursor) {
        query = db
          .prepare(
            `
          SELECT p.*, s.*
          FROM photos p
          JOIN sources s ON p.source_id = s.id
          WHERE (p.id, p.date_created) < (?, ?)
          ORDER BY p.date_created DESC
          LIMIT ?
        `,
          )
          .bind(cursor.id, cursor.dateCreated, limit + 1);
      } else {
        query = db
          .prepare(
            `
          SELECT p.*, s.*
          FROM photos p
          JOIN sources s ON p.source_id = s.id
          ORDER BY p.date_created DESC
          LIMIT ?
        `,
          )
          .bind(limit + 1);
      }

      type PhotoWithSource = ObjectRow & SourceRow;

      const result = await query.all<PhotoWithSource>();
      const hasNextPage = result.results.length > limit;

      const edges: PhotoEdge[] = await Promise.all(
        result.results.slice(0, limit).map(async (row) => {
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
              id: String(row.id),
              token,
            },
            cursor: new DbCursor(row.id, row.date_created).encode(),
          };
        }),
      );

      return {
        edges,
        pageInfo: {
          endCursor: edges[edges.length - 1]?.cursor,
          hasNextPage,
        },
      };
    },
  },
  Mutation: {
    createS3Source: async (_parent, { input }, context) => {
      const result = await context.db
        .prepare(
          `INSERT INTO sources (name, kind, s3_endpoint, s3_region, s3_bucket, s3_api_key, s3_api_key_secret)
           VALUES (?, 'S3', ?, ?, ?, ?, ?)
           RETURNING *`,
        )
        .bind(
          input.name,
          input.s3_endpoint,
          input.s3_region,
          input.s3_bucket,
          input.s3_api_key,
          input.s3_api_key_secret,
        )
        .first<SourceRow>();
      if (!result) {
        throw new GraphQLError("Failed to create source");
      }
      return toSourceResolver(result);
    },
    updateS3Source: async (_parent, { input }, context) => {
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (input.name != null) {
        updates.push("name = ?");
        values.push(input.name);
      }
      if (input.s3_endpoint != null) {
        updates.push("s3_endpoint = ?");
        values.push(input.s3_endpoint);
      }
      if (input.s3_region != null) {
        updates.push("s3_region = ?");
        values.push(input.s3_region);
      }
      if (input.s3_bucket != null) {
        updates.push("s3_bucket = ?");
        values.push(input.s3_bucket);
      }
      if (input.s3_api_key != null) {
        updates.push("s3_api_key = ?");
        values.push(input.s3_api_key);
      }
      if (input.s3_api_key_secret != null) {
        updates.push("s3_api_key_secret = ?");
        values.push(input.s3_api_key_secret);
      }

      values.push(Number(input.id));

      const result = await context.db
        .prepare(
          `UPDATE sources SET ${updates.join(", ")} WHERE id = ? RETURNING *`,
        )
        .bind(...values)
        .first<SourceRow>();

      if (!result) {
        throw new GraphQLError(`Source with id ${input.id} not found`);
      }

      return toSourceResolver(result);
    },
    deleteS3Source: async (_parent, { input }, context) => {
      const result = await context.db
        .prepare("DELETE FROM sources WHERE id = ? RETURNING *")
        .bind(Number(input.id))
        .first<SourceRow>();

      if (!result) {
        throw new GraphQLError(`Source with id ${input.id} not found`);
      }

      return toSourceResolver(result);
    },
  },
  Source: {
    __resolveType: () => "S3Source",
  },
  S3Object: {
    source: async (parent, _args, context) => {
      const result = await context.db
        .prepare("SELECT * FROM sources WHERE id = ?")
        .bind(parent.source_id)
        .first<SourceRow>();
      if (!result) {
        throw new GraphQLError(
          `Could not find source with id: ${parent.source_id}`,
        );
      }
      return toSourceResolver(result);
    },
  },
};

export function createGraphQLHandler(
  db: D1Database,
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
