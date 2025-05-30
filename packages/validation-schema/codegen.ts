import type { CodegenConfig } from "@graphql-codegen/cli";
import { DateTimeResolver } from "graphql-scalars";

const config: CodegenConfig = {
  schema: "../../apps/api/src/api/graphql/typeDefs/**/*.ts",
  overwrite: true,
  generates: {
    "./src/generated/graphql.ts": {
      plugins: [
        "typescript",
        // "typescript-validation-schema"
      ],
      config: {
        // schema: "zod",
        scalars: {
          DateTime: DateTimeResolver.extensions.codegenScalarType,
        },
        strictScalars: true,
      },
    },
  },
};

export default config;
