import type { IGraphQLConfig } from 'graphql-config'

const config: IGraphQLConfig = {
  schema: './schema.graphqls',
  documents: './src/**/*.graphql',
  extensions: {
    codegen: {
      generates: {
        './worker/generated/graphql.ts': {
          plugins: ['typescript', 'typescript-resolvers'],
          config: {
            useIndexSignature: true,
          },
        },
        './src/generated/graphql.ts': {
          plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
        },
      },
    },
  },
}

export default config