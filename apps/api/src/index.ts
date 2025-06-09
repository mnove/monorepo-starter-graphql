import { auth } from "@/lib/auth";
import prisma from "@repo/database";
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastify from "fastify";
import { createYoga } from "graphql-yoga";
import { serverConfig } from "./config/server-config";
import { GraphQLServerContext } from "./context";
import { envelopPlugins } from "./envelopPlugins";
import { renderApolloStudio } from "./utils/render-studio";
import { normalizeAuthSession, normalizeAuthUser } from "./utils/normalize";

const PORT = process.env.PORT || 5001;
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";
const USE_APOLLO_STUDIO =
  process.env.USE_APOLLO_STUDIO === "false" ? false : true;

const app = fastify({ logger: true });

app.register(fastifyCors, {
  origin: [...serverConfig.trustedOrigins],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});
app.register(fastifyHelmet, {
  contentSecurityPolicy: false,
});
app.register(fastifyCompress);

const yoga = createYoga<GraphQLServerContext>({
  plugins: envelopPlugins,
  // Integrate Fastify logger
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
  graphiql: process.env.NODE_ENV !== "production", // Disable GraphiQL in production
  renderGraphiQL: USE_APOLLO_STUDIO
    ? () => {
        return renderApolloStudio(PORT, GRAPHQL_ENDPOINT);
      }
    : undefined, // if undefind it uses default GraphiQL interface
});

app.route({
  url: "/test-prisma",
  method: "GET",
  handler: async (req, reply) => {
    // Test Prisma connection

    try {
      const result = await prisma.todo.findMany();
      reply.send(result);
    } catch (error) {
      app.log.error("Prisma Connection Error:", error);
      reply.status(500).send({
        error: "Internal server error",
        code: "PRISMA_CONNECTION_ERROR",
      });
    }
  },
});

// const resend = new Resend(process.env.RESEND_API_KEY);

// healthcheck endpoint simple return "ok"

app.route({
  url: "/healthcheck",
  method: "GET",
  handler: async (req, reply) => {
    try {
      reply.send("ok");
    } catch (error) {
      app.log.error("Healthcheck Error:", error);
      reply.status(500).send({
        error: "Internal server error",
        code: "HEALTHCHECK_ERROR",
      });
    }
  },
});

app.route({
  url: "/test-email",
  method: "GET",
  handler: async (req, reply) => {
    console.log("test-email");
    try {
      // Get both HTML and TXT templates with variables replaced
      // const emailContent = emailTemplates.verifyEmail({
      //   name: "Marcello",
      //   verificationUrl: "https://example.com/verify?token=abc123",
      //   companyName: "Your Company",
      // });

      // const workspaceName = "ACME Team";
      // const inviterName = "John Doe";
      // const emailContent = emailTemplates.inviteUser({
      //   name: "Marcello",
      //   acceptInvitationUrl: "https://example.com/verify?token=abc123",
      //   workspaceName: workspaceName,
      //   inviterName: inviterName,
      // });

      const result = "Email sent successfully with both HTML and TXT versions";
      reply.send(result);
    } catch (error) {
      app.log.error("Email error", error);
      reply.status(500).send({
        error: "Internal server error",
        code: "EMAIL_SEND_ERROR",
      });
    }
  },
});
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
    // Get authentication session
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) headers.append(key, value.toString());
    });

    const session = await auth.api.getSession({
      headers,
    });
    console.log("____session", session, "headers", headers);

    // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
    const response = await yoga.handleNodeRequestAndResponse(req, reply, {
      req,
      reply,
      user: normalizeAuthUser(session?.user),
      session: normalizeAuthSession(session),
    });

    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    reply.status(response.status);
    reply.send(response.body);

    return reply;
  },
});

const start = async () => {
  try {
    app.listen(
      {
        port: 5001,
        host: "0.0.0.0",
      },
      () => {
        console.log(
          `graphql server is running on ${serverConfig.baseURL}${GRAPHQL_ENDPOINT}`
        );
      }
    );

    console.log("environment", process.env.NODE_ENV);
    console.log("client URL", process.env.CLIENT_URL);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
