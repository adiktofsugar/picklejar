import { createSchema, createYoga } from 'graphql-yoga';
import type { Resolvers, S3Source, S3Object } from './generated/graphql';
import typeDefs from '../schema.graphqls?raw';

export interface GraphQLContext {
  db: D1Database;
}

// Database row types (match the actual DB schema)
interface SourceRow {
  id: number;
  name: string;
  kind: string;
  s3_endpoint: string;
  s3_region: string;
  s3_bucket: string;
  s3_api_key: string;
  s3_api_key_secret: string;
}

interface ObjectRow {
  id: number;
  key: string;
  source_id: number;
  date_created: number;
  lat: number | null;
  lng: number | null;
}

const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    sources: async (_parent, _args, context) => {
      const result = await context.db
        .prepare('SELECT * FROM sources')
        .all<SourceRow>();
      return result.results as unknown as S3Source[];
    },
    photos: async (_parent, _args, context) => {
      const result = await context.db
        .prepare('SELECT * FROM objects')
        .all<ObjectRow>();
      return result.results as unknown as S3Object[];
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
      return result as unknown as S3Source;
    },
    updateS3Source: async (_parent, { input }, context) => {
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (input.name != null) {
        updates.push('name = ?');
        values.push(input.name);
      }
      if (input.s3_endpoint != null) {
        updates.push('s3_endpoint = ?');
        values.push(input.s3_endpoint);
      }
      if (input.s3_region != null) {
        updates.push('s3_region = ?');
        values.push(input.s3_region);
      }
      if (input.s3_bucket != null) {
        updates.push('s3_bucket = ?');
        values.push(input.s3_bucket);
      }
      if (input.s3_api_key != null) {
        updates.push('s3_api_key = ?');
        values.push(input.s3_api_key);
      }
      if (input.s3_api_key_secret != null) {
        updates.push('s3_api_key_secret = ?');
        values.push(input.s3_api_key_secret);
      }

      values.push(Number(input.id));

      const result = await context.db
        .prepare(`UPDATE sources SET ${updates.join(', ')} WHERE id = ? RETURNING *`)
        .bind(...values)
        .first<SourceRow>();

      if (!result) {
        throw new Error(`Source with id ${input.id} not found`);
      }

      return result as unknown as S3Source;
    },
  },
  Source: {
    __resolveType: () => 'S3Source',
  },
  Photo: {
    __resolveType: () => 'S3Object',
  },
  S3Object: {
    source: async (parent, _args, context) => {
      const objectRow = parent as unknown as ObjectRow;
      const result = await context.db
        .prepare('SELECT * FROM sources WHERE id = ?')
        .bind(objectRow.source_id)
        .first<SourceRow>();
      return result as unknown as S3Source;
    },
  },
};


export function createGraphQLHandler(db: D1Database, graphqlEndpoint:string) {
  return createYoga<GraphQLContext>({
    schema: createSchema({ typeDefs, resolvers }),
    context: { db },
    graphqlEndpoint,
  });
}
