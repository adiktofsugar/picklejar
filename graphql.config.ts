import type { IGraphQLConfig } from "graphql-config";
import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptResolversPluginConfig } from "@graphql-codegen/typescript-resolvers";
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations";

const codegen: CodegenConfig = {
  generates: {
    "./worker/generated/graphql-resolvers.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        // I need this for correct type safety when using mapped types,
        //   otherwise I can end up not defining a resolver when I need to
        // For example, since I map the S3Source to an actual row, the "id" property
        //   will end up being a number instead of a string, so I need to add the resolver
        //   ...but I won't get an error for not having the mapped resolver if its optional
        avoidOptionals: true,
        // this replaces the types the resolvers are expected to return, so that a resolver
        //   can return the actual db query instead of a fully resolved object, which allows
        //   the resolver nesting to work as expected
        // Example:
        // query { source: Source } in graphql schema
        // mappers.Source = MySource
        // return type of `query.source` resolver is MySource
        // parent type of Source resolver is MySource
        // now the Source resolver can convert the db response to what it actually needs to be
        mappers: {
          S3Source: "../db-types#SelectableS3SourceRow",
        },
      } satisfies TypeScriptResolversPluginConfig,
    },
    "./src/generated/graphql-operations.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        avoidOptionals: true,
      } satisfies TypeScriptDocumentsPluginConfig,
    },
  },
};

const config: IGraphQLConfig = {
  schema: "./schema.graphqls",
  documents: "./src/**/*.graphql",
  extensions: {
    codegen,
  },
};

export default config;
