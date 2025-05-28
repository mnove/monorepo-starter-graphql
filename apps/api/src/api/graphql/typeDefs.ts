import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
// import {} from "../../../../packages/graphql-schema/src/schema"
const typesArray = loadFilesSync(
  // path.join(__dirname, "./typeDefs/**/*.graphql"),
  path.join(__dirname, "./typeDefs/**/*.graphql"),
  {
    extensions: ["graphql"],
  }
);

export const typeDefs = mergeTypeDefs(typesArray);
