import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { FastifyInstance } from "fastify";
import { createTestServer } from "./helpers/test-server";
import { TestDatabase } from "./helpers/test-database";
import { AuthTestHelper } from "./helpers/auth-helper";
import { GraphQLTestClient } from "./helpers/graphql-client";
import { AUTH_QUERIES } from "./helpers/graphql-queries";

describe("Authentication Integration Tests", () => {
  let testDb: TestDatabase;
  let server: FastifyInstance;
  let client: GraphQLTestClient;
  let authHelper: AuthTestHelper;
  let auth: any;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.setup();

    const serverSetup = createTestServer(testDb.getPrisma());
    server = serverSetup.app;
    auth = serverSetup.auth;

    await server.ready();

    client = new GraphQLTestClient(server);
    authHelper = new AuthTestHelper(server, auth, testDb);
  });

  afterAll(async () => {
    await server.close();
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.cleanup();
  });

  describe("User Registration", () => {
    it("should successfully register a new user", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "securePassword123",
        name: "New User",
      };

      const result = await authHelper.signUp(userData);

      expect(result.statusCode).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(userData.email);
      expect(result.data.user.name).toBe(userData.name);
      expect(result.cookies).toBeDefined();
    });

    it("should reject registration with invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "securePassword123",
        name: "Test User",
      };

      const result = await authHelper.signUp(userData);

      expect(result.statusCode).not.toBe(200);
      expect(result.statusCode).toBe(400); // Bad Request
    });

    it("should reject registration with weak password", async () => {
      const userData = {
        email: "test@example.com",
        password: "123", // Too weak
        name: "Test User",
      };

      const result = await authHelper.signUp(userData);

      expect(result.statusCode).not.toBe(200);
      expect(result.statusCode).toBe(400); // Bad Request
      expect(result.data.code).toBe("PASSWORD_TOO_SHORT");
    });

    it("should reject duplicate email registration", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "securePassword123",
        name: "First User",
      };

      // First registration should succeed
      const firstResult = await authHelper.signUp(userData);
      expect(firstResult.statusCode).toBe(200);

      // Second registration with same email should fail
      const secondResult = await authHelper.signUp({
        ...userData,
        name: "Second User",
      });

      expect(secondResult.statusCode).not.toBe(200);
      expect(secondResult.data.code).toBe("USER_ALREADY_EXISTS");
      expect(secondResult.statusCode).toBe(422); // Unprocessable Entity
    });
  });

  describe("User Authentication", () => {
    beforeEach(async () => {
      // Create a test user for authentication tests
      await authHelper.signUp({
        email: "auth@example.com",
        password: "testPassword123",
        name: "Auth User",
      });
    });

    it("should successfully sign in with valid credentials", async () => {
      const credentials = {
        email: "auth@example.com",
        password: "testPassword123",
      };

      const result = await authHelper.signIn(credentials);

      expect(result.statusCode).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(credentials.email);
      expect(result.cookies).toBeDefined();
      // Check that cookie is an array of length at least 1
      expect(result.cookies.length).toBeGreaterThan(0);
    });

    it("should reject sign in with invalid email", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "testPassword123",
      };

      const result = await authHelper.signIn(credentials);

      expect(result.statusCode).not.toBe(200);
      expect(result.data.code).toBe("INVALID_EMAIL_OR_PASSWORD");
      expect(result.statusCode).toBe(401); // Unauthorized
      expect(result.cookies.length).toBeLessThan(1); // No session cookie should be set
    });

    it("should reject sign in with invalid password", async () => {
      const credentials = {
        email: "auth@example.com",
        password: "wrongPassword",
      };

      const result = await authHelper.signIn(credentials);

      expect(result.statusCode).not.toBe(200);
      expect(result.data.code).toBe("INVALID_EMAIL_OR_PASSWORD");
      expect(result.statusCode).toBe(401); // Unauthorized
      expect(result.cookies.length).toBeLessThan(1);
    });

    it("should successfully sign out", async () => {
      // First sign in
      const signInResult = await authHelper.signIn({
        email: "auth@example.com",
        password: "testPassword123",
      });

      expect(signInResult.statusCode).toBe(200);
      // Extract session cookie from sign-in response
      const sessionCookie = authHelper.extractSessionCookie(
        signInResult.cookies
      );
      expect(sessionCookie).toBeTruthy();

      // Then sign out with the session cookie
      const signOutResult = await authHelper.signOut(sessionCookie);
      expect(signOutResult.statusCode).toBe(200);
    });
  });

  describe("GraphQL Authentication", () => {
    it("should return user data for authenticated requests", async () => {
      // Create and authenticate user
      const { sessionCookie } = await authHelper.createAuthenticatedUser({
        email: "graphql@example.com",
        name: "GraphQL User",
      });

      // console.log("Session cookie for GraphQL test:", sessionCookie);

      client.setAuth(sessionCookie);
      const result = await client.query(AUTH_QUERIES.GET_ME);

      // console.log("GraphQL test result:", JSON.stringify(result, null, 2));

      expect(result.status).toBe(200);
      // expect(client.hasErrors(result)).toBe(false);

      const userData = client.getData(result);

      expect(userData.viewer).toBeDefined();
      expect(userData.viewer.email).toBe("graphql@example.com");
      expect(userData.viewer.name).toBe("GraphQL User");
    });

    it("should return null for unauthenticated requests", async () => {
      client.clearAuth();
      const result = await client.query(AUTH_QUERIES.GET_ME);

      expect(result.status).toBe(401); // Unauthorized
      expect(client.hasErrors(result)).toBe(true);

      const userData = client.getData(result);
      expect(userData).toBeNull();
    });

    it("should handle session-based authentication flow", async () => {
      // Sign up new user
      const signUpResult = await authHelper.signUp({
        email: "session@example.com",
        password: "sessionPassword123",
        name: "Session User",
      });

      expect(signUpResult.statusCode).toBe(200);

      // Extract session cookie
      const sessionCookie = authHelper.extractSessionCookie(
        signUpResult.cookies
      );

      console.log("Session Cookie:", sessionCookie);
      expect(sessionCookie).toBeTruthy();

      // Test authenticated GraphQL request
      client.setAuth(sessionCookie);

      const profileResult = await client.query(AUTH_QUERIES.GET_ME);
      expect(client.hasErrors(profileResult)).toBe(undefined);

      const profileData = client.getData(profileResult);
      expect(profileData.viewer.email).toBe("session@example.com");
      expect(profileData.viewer.name).toBe("Session User");
    });
  });

  describe("Session Management", () => {
    it("should maintain session across multiple requests", async () => {
      const { sessionCookie } = await authHelper.createAuthenticatedUser({
        email: "persistent@example.com",
        name: "Persistent User",
      });

      // First request
      const result1 = await client.authenticatedQuery(
        AUTH_QUERIES.GET_ME,
        sessionCookie
      );

      expect(result1.status).toBe(200);
      expect(client.hasErrors(result1)).toBe(undefined);

      const data1 = client.getData(result1);
      expect(data1.viewer.email).toBe("persistent@example.com");

      // Second request with same session
      const result2 = await client.authenticatedQuery(
        AUTH_QUERIES.GET_ME,
        sessionCookie
      );
      expect(result2.status).toBe(200);
      expect(client.hasErrors(result2)).toBe(undefined);

      const data2 = client.getData(result2);
      expect(data2.viewer.email).toBe("persistent@example.com");
      expect(data2.viewer.id).toBe(data1.viewer.id); // Should be same user
    });

    it("should reject requests with invalid session token", async () => {
      const invalidSessionCookie =
        "better-auth.session_token=invalid-token-123";

      const result = await client.authenticatedQuery(
        AUTH_QUERIES.GET_ME,
        invalidSessionCookie
      );

      expect(result.status).toBe(401); // Unauthorized
      expect(client.hasErrors(result)).toBe(true);

      const data = client.getData(result);
      expect(data).toBeNull(); // Should not be authenticated
    });
  });
});
