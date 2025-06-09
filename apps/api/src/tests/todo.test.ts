import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { FastifyInstance } from "fastify";
import { createTestServer } from "./helpers/test-server";
import { TestDatabase } from "./helpers/test-database";
import { AuthTestHelper } from "./helpers/auth-helper";
import { GraphQLTestClient } from "./helpers/graphql-client";
import { TestDataFactory } from "./helpers/test-data-factory";
import { TODO_QUERIES, TODO_MUTATIONS } from "./helpers/graphql-queries";
import { CREATE_TODO } from "./graphql/todo/todoMutations";
import { GET_TODOS } from "./graphql/todo/todoQueries";

describe("Todo Integration Tests", () => {
  let testDb: TestDatabase;
  let server: FastifyInstance;
  let client: GraphQLTestClient;
  let authHelper: AuthTestHelper;
  let dataFactory: TestDataFactory;
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
    dataFactory = new TestDataFactory(testDb.getPrisma());
  });

  afterAll(async () => {
    await server.close();
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.cleanup();
  });

  describe("Unauthenticated Todo Access", () => {
    it("should reject unauthenticated todo creation", async () => {
      client.clearAuth();

      const result = await client.mutate(CREATE_TODO, {
        input: {
          title: "Unauthorized Todo",
          content: "This should fail",
        },
      });

      expect(result.status).toBe(401); // Unauthorized
      expect(client.hasErrors(result)).toBe(true);
      const error = client.getFirstError(result);

      expect(error).toContain("User not authenticated");
    });

    it("should reject unauthenticated todo queries", async () => {
      client.clearAuth();

      const result = await client.query(GET_TODOS);
      expect(result.status).toBe(401); // Unauthorized
      expect(client.hasErrors(result)).toBe(true);
      const error = client.getFirstError(result);
      expect(error).toContain("User not authenticated");
    });
  });

  describe("Authenticated Todo Operations", () => {
    let userSessionCookie: string;
    let userId: string;

    beforeEach(async () => {
      const { sessionCookie, user } = await authHelper.createAuthenticatedUser({
        email: "todouser@example.com",
        name: "Todo User",
      });

      userSessionCookie = sessionCookie;
      userId = user.id;
    });

    describe("Todo Creation", () => {
      it("should create a todo successfully", async () => {
        const todoInput = {
          title: "Test Todo",
          content: "This is a test todo",
        };

        const result = await client.authenticatedMutation(
          CREATE_TODO,
          userSessionCookie,
          { todo: todoInput }
        );

        expect(client.hasErrors(result)).toBe(false);

        const data = client.getData(result);
        expect(data.createTodo.title).toBe(todoInput.title);
        expect(data.createTodo.content).toBe(todoInput.content);
        expect(data.createTodo.completed).toBe(false);
        // expect(data.createTodo.authorId).toBe(userId);
        expect(data.createTodo.id).toBeDefined();
        expect(data.createTodo.createdAt).toBeDefined();
      });

      it("should create a todo with due date", async () => {
        const dueDate = new Date("2025-12-31");
        const todoInput = {
          title: "Todo with Due Date",
          content: "This todo has a due date",
          dueDate: dueDate.toISOString(),
        };

        const result = await client.authenticatedMutation(
          CREATE_TODO,
          userSessionCookie,
          { todo: todoInput }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        expect(data.createTodo.title).toBe(todoInput.title);
        expect(data.createTodo.dueDate).toBe(dueDate.toISOString());
      });

      it("should reject todo creation with invalid input", async () => {
        const invalidInput = {
          title: "", // Empty title should be invalid
          content: "Invalid todo",
        };

        const result = await client.authenticatedMutation(
          CREATE_TODO,
          userSessionCookie,
          { todo: invalidInput }
        );

        expect(client.hasErrors(result)).toBe(true);
      });
    });

    describe("Todo Querying", () => {
      beforeEach(async () => {
        // Create some test todos
        await dataFactory.createMultipleTodos(userId, 3, {
          title: "Query Test Todo",
        });
      });

      it("should fetch all user todos", async () => {
        const result = await client.authenticatedQuery(
          GET_TODOS,
          userSessionCookie
        );

        console.log("___result:", JSON.stringify(result, null, 2));

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        expect(data.todos).toHaveLength(3);
        data.todos.forEach((todo: any) => {
          expect(todo.authorId).toBe(userId);
          expect(todo.title).toContain("Query Test Todo");
        });
      });

      it("should fetch specific todo by ID", async () => {
        const createdTodo = await dataFactory.createTodo(userId, {
          title: "Specific Todo",
          content: "This is a specific todo",
        });

        const result = await client.authenticatedQuery(
          TODO_QUERIES.GET_TODO_BY_ID,
          userSessionCookie,
          { id: createdTodo.id }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        expect(data.todo.id).toBe(createdTodo.id);
        expect(data.todo.title).toBe("Specific Todo");
        expect(data.todo.content).toBe("This is a specific todo");
      });

      it("should return null for non-existent todo", async () => {
        const result = await client.authenticatedQuery(
          TODO_QUERIES.GET_TODO_BY_ID,
          userSessionCookie,
          { id: "non-existent-id" }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);
        expect(data.todo).toBeNull();
      });
    });

    describe("Todo Updates", () => {
      let testTodo: any;

      beforeEach(async () => {
        testTodo = await dataFactory.createTodo(userId, {
          title: "Original Title",
          content: "Original content",
          completed: false,
        });
      });

      it("should update todo title and content", async () => {
        const updateInput = {
          title: "Updated Title",
          content: "Updated content",
        };

        const result = await client.authenticatedMutation(
          TODO_MUTATIONS.UPDATE_TODO,
          userSessionCookie,
          { id: testTodo.id, input: updateInput }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        expect(data.updateTodo.id).toBe(testTodo.id);
        expect(data.updateTodo.title).toBe(updateInput.title);
        expect(data.updateTodo.content).toBe(updateInput.content);
        expect(data.updateTodo.updatedAt).not.toBe(testTodo.updatedAt);
      });

      it("should toggle todo completion status", async () => {
        const result = await client.authenticatedMutation(
          TODO_MUTATIONS.TOGGLE_TODO,
          userSessionCookie,
          { id: testTodo.id }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        expect(data.toggleTodo.id).toBe(testTodo.id);
        expect(data.toggleTodo.completed).toBe(true); // Should be toggled from false to true
      });

      it("should reject updates to non-existent todo", async () => {
        const result = await client.authenticatedMutation(
          TODO_MUTATIONS.UPDATE_TODO,
          userSessionCookie,
          {
            id: "non-existent-id",
            input: { title: "New Title" },
          }
        );

        expect(client.hasErrors(result)).toBe(true);
      });
    });

    describe("Todo Deletion", () => {
      let testTodo: any;

      beforeEach(async () => {
        testTodo = await dataFactory.createTodo(userId, {
          title: "Todo to Delete",
          content: "This todo will be deleted",
        });
      });

      it("should delete todo successfully", async () => {
        const result = await client.authenticatedMutation(
          TODO_MUTATIONS.DELETE_TODO,
          userSessionCookie,
          { id: testTodo.id }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);
        expect(data.deleteTodo.success).toBe(true);

        // Verify todo is actually deleted
        const fetchResult = await client.authenticatedQuery(
          TODO_QUERIES.GET_TODO_BY_ID,
          userSessionCookie,
          { id: testTodo.id }
        );

        const fetchData = client.getData(fetchResult);
        expect(fetchData.todo).toBeNull();
      });

      it("should reject deletion of non-existent todo", async () => {
        const result = await client.authenticatedMutation(
          TODO_MUTATIONS.DELETE_TODO,
          userSessionCookie,
          { id: "non-existent-id" }
        );

        expect(client.hasErrors(result)).toBe(true);
      });
    });
  });

  describe("User Isolation", () => {
    let user1SessionCookie: string;
    let user2SessionCookie: string;
    let user1Id: string;
    let user2Id: string;

    beforeEach(async () => {
      const user1 = await authHelper.createAuthenticatedUser({
        email: "user1@example.com",
        name: "User One",
      });

      const user2 = await authHelper.createAuthenticatedUser({
        email: "user2@example.com",
        name: "User Two",
      });

      user1SessionCookie = user1.sessionCookie;
      user2SessionCookie = user2.sessionCookie;
      user1Id = user1.user.id;
      user2Id = user2.user.id;
    });

    it("should isolate todos between users", async () => {
      // User 1 creates todos
      await dataFactory.createMultipleTodos(user1Id, 2, {
        title: "User 1 Todo",
      });

      // User 2 creates todos
      await dataFactory.createMultipleTodos(user2Id, 3, {
        title: "User 2 Todo",
      });

      // User 1 should only see their todos
      const user1Result = await client.authenticatedQuery(
        TODO_QUERIES.GET_TODOS,
        user1SessionCookie
      );

      expect(client.hasErrors(user1Result)).toBe(false);
      const user1Data = client.getData(user1Result);
      expect(user1Data.todos).toHaveLength(2);
      user1Data.todos.forEach((todo: any) => {
        expect(todo.authorId).toBe(user1Id);
        expect(todo.title).toContain("User 1 Todo");
      });

      // User 2 should only see their todos
      const user2Result = await client.authenticatedQuery(
        TODO_QUERIES.GET_TODOS,
        user2SessionCookie
      );

      expect(client.hasErrors(user2Result)).toBe(false);
      const user2Data = client.getData(user2Result);
      expect(user2Data.todos).toHaveLength(3);
      user2Data.todos.forEach((todo: any) => {
        expect(todo.authorId).toBe(user2Id);
        expect(todo.title).toContain("User 2 Todo");
      });
    });

    it("should prevent users from accessing other users todos", async () => {
      // User 1 creates a todo
      const user1Todo = await dataFactory.createTodo(user1Id, {
        title: "Private Todo",
      });

      // User 2 tries to access User 1's todo
      const result = await client.authenticatedQuery(
        TODO_QUERIES.GET_TODO_BY_ID,
        user2SessionCookie,
        { id: user1Todo.id }
      );

      expect(client.hasErrors(result)).toBe(false);
      const data = client.getData(result);
      expect(data.todo).toBeNull(); // Should not be able to access other user's todo
    });

    it("should prevent users from updating other users todos", async () => {
      // User 1 creates a todo
      const user1Todo = await dataFactory.createTodo(user1Id, {
        title: "Original Title",
      });

      // User 2 tries to update User 1's todo
      const result = await client.authenticatedMutation(
        TODO_MUTATIONS.UPDATE_TODO,
        user2SessionCookie,
        {
          id: user1Todo.id,
          input: { title: "Hacked Title" },
        }
      );

      expect(client.hasErrors(result)).toBe(true);
    });
  });
});
