import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // schema: "./introspection/introspection.json",
  schema: "../api/src/api/graphql/typeDefs/**/*.graphql",
  documents: ["src/graphql/**/*.tsx"],
  generates: {
    "./src/generated/": {
      preset: "client",
      //   plugins: ["typescript-apollo-client-helpers"],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
