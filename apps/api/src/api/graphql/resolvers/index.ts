import { TodoQueries, TodoMutations, TodoFieldResolvers } from "./todo";
import {
  CategoryQueries,
  CategoryMutations,
  CategoryFieldResolvers,
} from "./category";
import { DateTimeResolver } from "graphql-scalars";
import { Resolvers } from "@repo/schema";
import { GraphQLServerContext } from "@/context";

export const resolvers: Resolvers = {
  Query: {
    ...TodoQueries,
    ...CategoryQueries,
  },
  Mutation: {
    ...TodoMutations,
    ...CategoryMutations,
  },
  // Type-specific field resolvers
  Todo: {
    ...TodoFieldResolvers,
  },
  Category: {
    ...CategoryFieldResolvers,
  },
  DateTime: DateTimeResolver, // Custom scalar resolver for DateTime

  // Add type resolvers for the TodoResult union type
  TodoResult: {
    __resolveType(obj) {
      if ("__typename" in obj && typeof obj.__typename === "string") {
        return obj.__typename;
      }
      throw new Error(
        "Could not resolve type for TodoResult: __typename is missing"
      );
    },
  },

  // Add type resolvers for the TodoDeleteResult union type
  TodoDeleteResult: {
    __resolveType(obj) {
      if ("__typename" in obj && typeof obj.__typename === "string") {
        return obj.__typename;
      }
      throw new Error(
        "Could not resolve type for TodoDeleteResult: __typename is missing"
      );
    },
  },

  // Add type resolver for the Error interface
  Error: {
    __resolveType(obj) {
      if ("__typename" in obj && typeof obj.__typename === "string") {
        return obj.__typename;
      }
      throw new Error(
        "Could not resolve type for Error interface: __typename is missing"
      );
    },
  },

  // Add type resolvers for the CategoryResult union type
  CategoryResult: {
    __resolveType(obj) {
      if ("__typename" in obj && typeof obj.__typename === "string") {
        return obj.__typename;
      }
      throw new Error(
        "Could not resolve type for CategoryResult: __typename is missing"
      );
    },
  },

  // Add type resolvers for the CategoryDeleteResult union type
  CategoryDeleteResult: {
    __resolveType(obj) {
      if ("__typename" in obj && typeof obj.__typename === "string") {
        return obj.__typename;
      }
      throw new Error(
        "Could not resolve type for CategoryDeleteResult: __typename is missing"
      );
    },
  },
};
