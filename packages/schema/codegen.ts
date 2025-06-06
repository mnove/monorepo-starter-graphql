import { CodegenConfig } from "@graphql-codegen/cli";
import { DateTimeResolver } from "graphql-scalars";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./src/typeDefs/**/*.ts",
  generates: {
    "./generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        contextType: "../src/context#GraphQLServerContext", // To use the context in resolvers
        // strictScalars: true,
        // mapperTypeSuffix: "Model",
        // mappers: {
        //   Book: "@prisma/client#Book",
        //   User: "@prisma/client#User",
        // },
        resolversNonOptionalTypename: {
          // Make __typename non-optional (we use this as a discriminator for unions among other things)
          unionMember: true,
          interfaceImplementingType: true,
        },
        scalars: {
          DateTime: DateTimeResolver.extensions.codegenScalarType,
        },
        strictScalars: true,
      },
    },
  },
};

export default config;
