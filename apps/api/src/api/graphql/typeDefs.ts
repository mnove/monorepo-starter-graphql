import { mergeTypeDefs } from "@graphql-tools/merge";
import { categoryTypeDefs } from "./typeDefs/category";
import { commonTypeDefs } from "./typeDefs/common";
import { errorTypeDefs } from "./typeDefs/error";
import { scalarsTypeDefs } from "./typeDefs/scalars";
import { todosTypeDefs } from "./typeDefs/todo";

// This file is used to merge all GraphQL type definitions into a single schema.
const typesArray = [
  categoryTypeDefs,
  commonTypeDefs,
  errorTypeDefs,
  scalarsTypeDefs,
  todosTypeDefs,
];

/**
 * Merges all GraphQL type definitions into a single schema.
 */
export const typeDefs = mergeTypeDefs(typesArray);
