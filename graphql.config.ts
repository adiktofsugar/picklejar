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
        avoidOptionals: {
          defaultValue: true,
          field: true,
          inputValue: true,
          mutation: true,
          query: true,
          object: true,
          // resolvers are optional, otherwise we need to make one for every key
          resolvers: false,
          subscription: true,
        },
        mappers: {
          S3Object: "../db-types#ObjectRowResolver",
          S3Source: "../db-types#SourceRowResolver",
        },
      } satisfies TypeScriptResolversPluginConfig,
    },
    "./src/generated/graphql-operations.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {} satisfies TypeScriptDocumentsPluginConfig,
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
