import { mergeTypeDefs } from "@graphql-tools/merge";
import { DocumentNode } from "graphql";
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

export * from "./typeDefs/category";
export * from "./typeDefs/common";
export * from "./typeDefs/error";
export * from "./typeDefs/scalars";
export * from "./typeDefs/todo";

// Generated graphql types
export * from "../generated/graphql";

// Export context for use in resolvers
export type { GraphQLServerContext } from "./context";
/**
 * Merges all GraphQL type definitions into a single schema.
 */
export const typeDefs: DocumentNode = mergeTypeDefs(typesArray);
