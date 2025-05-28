import { CodegenConfig } from "@graphql-codegen/cli";
import { DateTimeResolver } from "graphql-scalars";
const config: CodegenConfig = {
  overwrite: true,
  schema: "./src/api/graphql/typeDefs/**/*.graphql",
  generates: {
    "./src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        contextType: "../context#GraphQLServerContext",
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
