import { User, PrismaClient } from "@repo/database";
import { useExtendContext, useSchema } from "@envelop/core";
import {
  createUnauthenticatedError,
  ResolveUserFn,
  useGenericAuth,
  ValidateUserFn,
} from "@envelop/generic-auth";
import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { resolvers } from "./api/graphql/resolvers";
import { typeDefs } from "@repo/schema";
import { createContext, GraphQLServerContext } from "./context";
import { auth } from "./lib/auth";
import { normalizeAuthUser } from "./utils/normalize";
import { createUnauthorizedError } from "./utils/errors";
import { GraphQLError } from "graphql";
import prisma from "@repo/database";

// Export the Context type from GraphQLServerContext
export type Context = GraphQLServerContext;

/**
 * Creates an executable GraphQL schema using the provided type definitions and resolvers.
 */
const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create context function that accepts a custom Prisma client
const createContextWithPrisma = (prismaClient: PrismaClient) => {
  return async (contextValue: any): Promise<GraphQLServerContext> => {
    // Extract user and session from the context passed from the handler
    const { user = null, session = null, req, reply } = contextValue || {};

    return {
      prisma: prismaClient,
      user,
      session,
      req,
      reply,
    };
  };
};

// Create envelop plugins with configurable Prisma client
export const createEnvelopPlugins = (prismaClient?: PrismaClient) => {
  const prismaToUse = prismaClient || prisma;

  // Define user resolver function that works with Better Auth
  const resolveUserFn: ResolveUserFn<User, GraphQLServerContext> = async (
    context
  ) => {
    console.log("resolveUserFn - session:", context.user);

    // If user is already in context (from Fastify route handler), use it
    if (context.user) {
      return context.user;
    }
    // Otherwise try to get user from authorization header
    try {
      // Safely access authorization header if request exists
      if (context.req && context.req.headers) {
        const session = await auth.api.getSession({
          headers: context.req.headers,
        });
        const user = session?.user;

        // Normalize the user to match Prisma types
        return normalizeAuthUser(session?.user);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }

    return null; // When no user is found:
  };

  // Define user validation function
  const validateUser: ValidateUserFn<any> = ({ user }) => {
    if (!user) {
      // throw createUnauthorizedError("User not authenticated");
      throw createUnauthenticatedError({
        message: "User not authenticated",
        statusCode: 401,
      });
    }
  };

  return [
    useSchema(executableSchema),
    useDisableIntrospection({
      isDisabled: () => process.env.NODE_ENV !== "development",
    }),
    EnvelopArmorPlugin({
      blockFieldSuggestion: {
        enabled: process.env.NODE_ENV !== "development",
        mask: "[NO_SUGGESTION_AVAILABLE]", // Mask for blocked fields
      },
      costLimit: {
        enabled: process.env.NODE_ENV !== "development",
        maxCost: 5000,
        objectCost: 2,
        scalarCost: 1,
        depthCostFactor: 1.5,
        ignoreIntrospection: false,
      },
      maxAliases: {
        enabled: process.env.NODE_ENV !== "development",
        n: 15, // Max aliases
      },
      maxDepth: {
        enabled: process.env.NODE_ENV !== "development",
        n: 10, // Max depth
        ignoreIntrospection: false,
      },
      maxTokens: {
        enabled: process.env.NODE_ENV !== "developments",
        n: 1000, // Max tokens
      },
      maxDirectives: {
        enabled: process.env.NODE_ENV !== "development",
        n: 50, // Max directives
      },
    }),

    useGenericAuth({
      resolveUserFn,
      validateUser,
      mode: "protect-all", // Only inject user into context, validate in resolvers as needed
      contextFieldName: "user",
    }),
    useExtendContext(createContextWithPrisma(prismaToUse)), // should be after auth so it has access
  ];
};

// Export default envelop plugins for production use
export const envelopPlugins = createEnvelopPlugins();
