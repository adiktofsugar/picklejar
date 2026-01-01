import { createSchema, createYoga } from "graphql-yoga";
import type { Resolvers } from "./generated/graphql-resolvers";
import type {
  SourceRow,
  ObjectRow,
  SourceRowResolver,
  ObjectRowResolver,
} from "./db-types";
import typeDefs from "../schema.graphqls?raw";
import { GraphQLError } from "graphql";

export interface GraphQLContext {
  db: D1Database;
}

function toSourceResolver(row: SourceRow): SourceRowResolver {
  return { ...row, id: String(row.id) };
}

function toObjectResolver(row: ObjectRow): ObjectRowResolver {
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
    photos: async (_parent, _args, context) => {
      const result = await context.db
        .prepare("SELECT * FROM objects")
        .all<ObjectRow>();
      return result.results.map(toObjectResolver);
    },
  },
  Mutation: {
    createS3Source: async (_parent, { input }, context) => {
      const result = await context.db
        .prepare(
          `INSERT INTO sources (name, kind, s3_endpoint, s3_region, s3_bucket, s3_api_key, s3_api_key_secret)
           VALUES (?, 'S3', ?, ?, ?, ?, ?)
           RETURNING *`
        )
        .bind(
          input.name,
          input.s3_endpoint,
          input.s3_region,
          input.s3_bucket,
          input.s3_api_key,
          input.s3_api_key_secret
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
          `UPDATE sources SET ${updates.join(", ")} WHERE id = ? RETURNING *`
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
  Photo: {
    __resolveType: () => "S3Object",
  },
  S3Object: {
    source: async (parent, _args, context) => {
      const result = await context.db
        .prepare("SELECT * FROM sources WHERE id = ?")
        .bind(parent.source_id)
        .first<SourceRow>();
      if (!result) {
        throw new GraphQLError(
          `Could not find source with id: ${parent.source_id}`
        );
      }
      return toSourceResolver(result);
    },
  },
};

export function createGraphQLHandler(db: D1Database, graphqlEndpoint: string) {
  return createYoga<GraphQLContext>({
    schema: createSchema({ typeDefs, resolvers }),
    context: { db },
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
