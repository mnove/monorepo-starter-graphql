import fastify, { FastifyInstance } from "fastify";
import { createYoga } from "graphql-yoga";
import { createEnvelopPlugins } from "../../envelopPlugins";
import { GraphQLServerContext } from "../../context";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@repo/database";
import fastifyCors from "@fastify/cors";
import { normalizeAuthSession, normalizeAuthUser } from "../../utils/normalize";

export function createTestServer(prisma: PrismaClient) {
  const app = fastify({
    logger: false, // Disable logging in tests
    disableRequestLogging: true,
  });

  // Configure CORS for testing
  app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  const auth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    secret: "test-secret-key",
    baseURL: "http://localhost:5001",
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      defaultCookieAttributes: {
        secure: false, // Allow HTTP in test environment
        httpOnly: true,
        sameSite: "lax", // Less restrictive for testing
        partitioned: false, // Disable for test environment
      },
    },
  });

  // Create envelop plugins with the test Prisma client
  const testEnvelopPlugins = createEnvelopPlugins(prisma);

  const yoga = createYoga<GraphQLServerContext>({
    plugins: testEnvelopPlugins,
    graphiql: false,
    logging: false,
  });

  // Register Better Auth routes
  //   app.all("/api/auth/*", async (request, reply) => {
  //     return auth.handler(request.raw, {
  //       headers: reply.getHeaders(),
  //       status: (code: number) => reply.code(code),
  //       json: (obj: any) => reply.send(obj),
  //       redirect: (url: string) => reply.redirect(url),
  //       cookie: (name: string, value: string, options: any) => {
  //         reply.setCookie(name, value, options);
  //       },
  //     });
  //   });
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        console.log("req", req);

        // Process authentication request
        const response = await auth.handler(req);

        console.log("authentication Response:", response);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        app.log.error("Authentication Error:", error);
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  app.route({
    url: "/graphql",
    method: ["GET", "POST", "OPTIONS"],
    handler: async (req, reply) => {
      // Extract session from request
      let sessionData = null;
      try {
        sessionData = await auth.api.getSession({
          headers: req.headers as any,
        });
      } catch (error) {
        // Session extraction failed, continue with null user
      }

      // Pass context data in the same format as main server
      // This allows envelop plugins to process the context correctly
      const response = await yoga.handleNodeRequestAndResponse(req, reply, {
        req,
        reply,
        user: normalizeAuthUser(sessionData?.user),
        session: normalizeAuthSession(sessionData?.session),
      });

      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      reply.status(response.status);
      reply.send(response.body);
      return reply;
    },
  });

  // Health check endpoint
  app.route({
    url: "/healthcheck",
    method: "GET",
    handler: async (req, reply) => {
      reply.send({ status: "ok" });
    },
  });

  return { app, auth, prisma };
}
