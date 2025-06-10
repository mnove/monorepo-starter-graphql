import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { FastifyInstance } from "fastify";
import { createTestServer } from "./helpers/test-server";
import { TestDatabase } from "./helpers/test-database";
import { AuthTestHelper } from "./helpers/auth-helper";
import { TypedGraphQLTestClient } from "./helpers/graphql-client";
import { TestDataFactory } from "./helpers/test-data-factory";
import { GET_TODOS, GET_TODO_BY_ID } from "./graphql/todo/todoQueries";
import {
  CREATE_TODO,
  UPDATE_TODO,
  DELETE_TODO,
} from "./graphql/todo/todoMutations";
import {
  GET_CATEGORIES,
  GET_CATEGORY_BY_ID,
} from "./graphql/categories/categoryQueries";
import {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "./graphql/categories/categoryMutations";
import { AUTH_QUERIES } from "./helpers/graphql-queries";

describe("End-to-End Integration Tests", () => {
  let testDb: TestDatabase;
  let server: FastifyInstance;
  let client: TypedGraphQLTestClient;
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

    client = new TypedGraphQLTestClient(server);
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

  describe("Complete User Journey", () => {
    it("should handle complete user registration, authentication, and todo management flow", async () => {
      // 1. User Registration
      const userData = {
        email: "journey@example.com",
        password: "securePassword123",
        name: "Journey User",
      };

      const signUpResult = await authHelper.signUp(userData);
      expect(signUpResult.statusCode).toBe(200);
      expect(signUpResult.data.user.email).toBe(userData.email);

      // 2. Extract session and authenticate
      const sessionCookie = authHelper.extractSessionCookie(
        signUpResult.cookies
      );
      expect(sessionCookie).toBeTruthy();
      client.setAuth(sessionCookie);

      // 3. Verify user profile
      const profileResult = await client.query(AUTH_QUERIES.GET_ME);
      expect(client.hasErrors(profileResult)).toBe(false);
      const profileData = client.getData(profileResult);
      expect(profileData.viewer.email).toBe(userData.email);
      expect(profileData.viewer.name).toBe(userData.name);

      // 4. Create categories
      const workCategory = await client.mutate(CREATE_CATEGORY, {
        category: {
          name: "Work",
          description: "Work-related tasks",
          color: "#FF5733",
        },
      });

      expect(client.hasErrors(workCategory)).toBe(false);
      const workCategoryData = client.getData(workCategory);
      if (workCategoryData?.createCategory.__typename !== "Category") {
        throw new Error("Expected createCategory to return a Category type");
      }
      expect(workCategoryData.createCategory.name).toBe("Work");

      const personalCategory = await client.mutate(CREATE_CATEGORY, {
        category: {
          name: "Personal",
          description: "Personal tasks",
          color: "#33FF57",
        },
      });

      expect(client.hasErrors(personalCategory)).toBe(false);
      const personalCategoryData = client.getData(personalCategory);
      if (personalCategoryData?.createCategory.__typename !== "Category") {
        throw new Error("Expected createCategory to return a Category type");
      }
      expect(personalCategoryData.createCategory.name).toBe("Personal");

      // 5. Create todos
      const workTodo = await client.mutate(CREATE_TODO, {
        todo: {
          title: "Finish project presentation",
          content:
            "Prepare slides and practice presentation for Monday meeting",
          dueDate: new Date("2025-12-31").toISOString(),
        },
      });

      expect(client.hasErrors(workTodo)).toBe(false);
      const workTodoData = client.getData(workTodo);
      if (workTodoData?.createTodo.__typename !== "Todo") {
        throw new Error("Expected createTodo to return a Todo type");
      }
      expect(workTodoData.createTodo.title).toBe("Finish project presentation");

      const personalTodo = await client.mutate(CREATE_TODO, {
        todo: {
          title: "Buy groceries",
          content: "Milk, bread, eggs, and vegetables",
        },
      });

      expect(client.hasErrors(personalTodo)).toBe(false);
      const personalTodoData = client.getData(personalTodo);
      if (personalTodoData?.createTodo.__typename !== "Todo") {
        throw new Error("Expected createTodo to return a Todo type");
      }
      expect(personalTodoData.createTodo.title).toBe("Buy groceries");

      // 6. Fetch all todos
      const todosResult = await client.query(GET_TODOS);
      expect(client.hasErrors(todosResult)).toBe(false);
      const todosData = client.getData(todosResult);
      if (todosData?.todos.__typename !== "TodoListResult") {
        throw new Error("Expected todos to return a TodoListResult type");
      }
      expect(todosData.todos.connection?.edges).toHaveLength(2);

      // 7. Fetch all categories
      const categoriesResult = await client.query(GET_CATEGORIES);
      expect(client.hasErrors(categoriesResult)).toBe(false);
      const categoriesData = client.getData(categoriesResult);
      if (categoriesData?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }
      expect(categoriesData.categories.items).toHaveLength(2);

      // 8. Update a todo
      const updateResult = await client.mutate(UPDATE_TODO, {
        todo: {
          id: personalTodoData.createTodo.id,
          title: "Buy groceries and cook dinner",
          content: "Milk, bread, eggs, vegetables, and ingredients for pasta",
        },
      });

      expect(client.hasErrors(updateResult)).toBe(false);
      const updatedData = client.getData(updateResult);
      if (updatedData?.updateTodo.__typename !== "Todo") {
        throw new Error("Expected updateTodo to return a Todo type");
      }
      expect(updatedData.updateTodo.title).toBe(
        "Buy groceries and cook dinner"
      );

      // 9. Toggle todo completion
      const toggleResult = await client.mutate(UPDATE_TODO, {
        todo: {
          id: personalTodoData.createTodo.id,
          completed: true,
        },
      });

      expect(client.hasErrors(toggleResult)).toBe(false);
      const toggledData = client.getData(toggleResult);
      if (toggledData?.updateTodo.__typename !== "Todo") {
        throw new Error("Expected updateTodo to return a Todo type");
      }
      expect(toggledData.updateTodo.completed).toBe(true);

      // 10. Delete a category
      const deleteResult = await client.mutate(DELETE_CATEGORY, {
        deleteCategoryId: personalCategoryData.createCategory.id,
      });

      expect(client.hasErrors(deleteResult)).toBe(false);
      const deletedData = client.getData(deleteResult);
      if (deletedData?.deleteCategory.__typename !== "Category") {
        throw new Error("Expected deleteCategory to return a Category type");
      }
      expect(deletedData.deleteCategory.id).toBe(
        personalCategoryData.createCategory.id
      );

      // 11. Verify category is deleted
      const finalCategoriesResult = await client.query(GET_CATEGORIES);
      expect(client.hasErrors(finalCategoriesResult)).toBe(false);
      const finalCategoriesData = client.getData(finalCategoriesResult);
      if (finalCategoriesData?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }
      expect(finalCategoriesData.categories.items).toHaveLength(1);
      expect(finalCategoriesData.categories.items?.[0]?.name).toBe("Work");
    });
  });

  describe("Multi-User Collaboration Scenarios", () => {
    it("should handle multiple users working independently", async () => {
      // Create three users
      const user1 = await authHelper.createAuthenticatedUser({
        email: "user1@company.com",
        name: "Alice Manager",
      });

      const user2 = await authHelper.createAuthenticatedUser({
        email: "user2@company.com",
        name: "Bob Developer",
      });

      const user3 = await authHelper.createAuthenticatedUser({
        email: "user3@company.com",
        name: "Carol Designer",
      });

      // User 1 (Manager) creates management-related todos and categories
      const user1Todos = await Promise.all([
        client.authenticatedMutation(CREATE_TODO, user1.sessionCookie, {
          todo: {
            title: "Review team performance",
            content: "Quarterly review meeting prep",
          },
        }),
        client.authenticatedMutation(CREATE_TODO, user1.sessionCookie, {
          todo: {
            title: "Budget planning",
            content: "Prepare Q2 budget proposal",
          },
        }),
      ]);

      const user1Category = await client.authenticatedMutation(
        CREATE_CATEGORY,
        user1.sessionCookie,
        {
          category: {
            name: "Management",
            description: "Management tasks",
            color: "#FF0000",
          },
        }
      );

      // User 2 (Developer) creates development-related todos
      const user2Todos = await Promise.all([
        client.authenticatedMutation(CREATE_TODO, user2.sessionCookie, {
          todo: {
            title: "Fix authentication bug",
            content: "Debug JWT token validation",
          },
        }),
        client.authenticatedMutation(CREATE_TODO, user2.sessionCookie, {
          todo: {
            title: "Implement new feature",
            content: "Add user preferences panel",
          },
        }),
        client.authenticatedMutation(CREATE_TODO, user2.sessionCookie, {
          todo: {
            title: "Write unit tests",
            content: "Increase test coverage to 90%",
          },
        }),
      ]);

      const user2Category = await client.authenticatedMutation(
        CREATE_CATEGORY,
        user2.sessionCookie,
        {
          category: {
            name: "Development",
            description: "Code-related tasks",
            color: "#00FF00",
          },
        }
      );

      // User 3 (Designer) creates design-related todos
      const user3Todos = await Promise.all([
        client.authenticatedMutation(CREATE_TODO, user3.sessionCookie, {
          todo: {
            title: "Design new landing page",
            content: "Create mockups for marketing site",
          },
        }),
        client.authenticatedMutation(CREATE_TODO, user3.sessionCookie, {
          todo: {
            title: "Update style guide",
            content: "Add new color palette and typography",
          },
        }),
      ]);

      const user3Category = await client.authenticatedMutation(
        CREATE_CATEGORY,
        user3.sessionCookie,
        {
          category: {
            name: "Design",
            description: "Design and UI tasks",
            color: "#0000FF",
          },
        }
      );

      // Verify each user can only see their own data

      // User 1 verification
      const user1TodosResult = await client.authenticatedQuery(
        GET_TODOS,
        user1.sessionCookie
      );
      const user1TodosData = client.getData(user1TodosResult);
      if (user1TodosData?.todos.__typename !== "TodoListResult") {
        throw new Error("Expected todos to return a TodoListResult type");
      }
      expect(user1TodosData.todos.connection?.edges).toHaveLength(2);

      const user1CategoriesResult = await client.authenticatedQuery(
        GET_CATEGORIES,
        user1.sessionCookie
      );
      const user1CategoriesData = client.getData(user1CategoriesResult);
      if (user1CategoriesData?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }
      expect(user1CategoriesData.categories.items).toHaveLength(1);
      expect(user1CategoriesData.categories.items?.[0]?.name).toBe(
        "Management"
      );

      // User 2 verification
      const user2TodosResult = await client.authenticatedQuery(
        GET_TODOS,
        user2.sessionCookie
      );
      const user2TodosData = client.getData(user2TodosResult);
      if (user2TodosData?.todos.__typename !== "TodoListResult") {
        throw new Error("Expected todos to return a TodoListResult type");
      }
      expect(user2TodosData.todos.connection?.edges).toHaveLength(3);

      const user2CategoriesResult = await client.authenticatedQuery(
        GET_CATEGORIES,
        user2.sessionCookie
      );
      const user2CategoriesData = client.getData(user2CategoriesResult);
      if (user2CategoriesData?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }
      expect(user2CategoriesData.categories.items).toHaveLength(1);
      expect(user2CategoriesData.categories.items?.[0]?.name).toBe(
        "Development"
      );

      // User 3 verification
      const user3TodosResult = await client.authenticatedQuery(
        GET_TODOS,
        user3.sessionCookie
      );
      const user3TodosData = client.getData(user3TodosResult);
      if (user3TodosData?.todos.__typename !== "TodoListResult") {
        throw new Error("Expected todos to return a TodoListResult type");
      }
      expect(user3TodosData.todos.connection?.edges).toHaveLength(2);

      const user3CategoriesResult = await client.authenticatedQuery(
        GET_CATEGORIES,
        user3.sessionCookie
      );
      const user3CategoriesData = client.getData(user3CategoriesResult);
      if (user3CategoriesData?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }
      expect(user3CategoriesData.categories.items).toHaveLength(1);
      expect(user3CategoriesData.categories.items?.[0]?.name).toBe("Design");

      // Test cross-user access prevention
      const user1TodoData = client.getData(user1Todos[0]);
      if (user1TodoData?.createTodo.__typename !== "Todo") {
        throw new Error("Expected createTodo to return a Todo type");
      }
      const user1TodoId = user1TodoData.createTodo.id;

      // User 2 tries to access User 1's todo
      const crossAccessResult = await client.authenticatedQuery(
        GET_TODO_BY_ID,
        user2.sessionCookie,
        { todoByIdId: user1TodoId }
      );

      expect(client.hasErrors(crossAccessResult)).toBe(true);
      const crossAccessData = client.getData(crossAccessResult);
      if (crossAccessData?.todoById.__typename !== "NotFoundError") {
        throw new Error("Expected todoById to return a NotFoundError type");
      }
      expect(crossAccessData.todoById.__typename).toBe("NotFoundError");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    let userSessionCookie: string;
    let userId: string;

    beforeEach(async () => {
      const { sessionCookie, user } = await authHelper.createAuthenticatedUser({
        email: "errortest@example.com",
        name: "Error Test User",
      });
      userSessionCookie = sessionCookie;
      userId = user.id;
    });

    it("should handle malformed GraphQL queries gracefully", async () => {
      const malformedQuery = `
        query {
          todos {
            nonExistentField
          }
        }
      `;

      const result = await client.authenticatedQuery(
        malformedQuery,
        userSessionCookie
      );

      expect(client.hasErrors(result)).toBe(true);
      expect(result.status).toBe(200); // GraphQL errors still return 200
    });

    it("should handle server errors gracefully", async () => {
      // Test with invalid ID format that might cause database errors
      const result = await client.authenticatedQuery(
        GET_TODO_BY_ID,
        userSessionCookie,
        {
          todoByIdId:
            "definitely-not-a-valid-id-format-that-might-cause-db-errors",
        }
      );

      // Should handle gracefully, not crash
      expect(result.status).toBe(200);
      // Should return NotFoundError for invalid ID
      expect(client.hasErrors(result)).toBe(true);
      const data = client.getData(result);
      if (data?.todoById.__typename !== "NotFoundError") {
        throw new Error("Expected todoById to return a NotFoundError type");
      }
      expect(data.todoById.__typename).toBe("NotFoundError");
    });

    it("should handle concurrent operations correctly", async () => {
      // Create multiple todos concurrently
      const concurrentTodoCreations = Array.from({ length: 5 }, (_, i) =>
        client.authenticatedMutation(CREATE_TODO, userSessionCookie, {
          todo: {
            title: `Concurrent Todo ${i + 1}`,
            content: `Content for todo ${i + 1}`,
          },
        })
      );

      const results = await Promise.all(concurrentTodoCreations);

      // All should succeed
      results.forEach((result, index) => {
        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);
        if (data?.createTodo.__typename !== "Todo") {
          throw new Error("Expected createTodo to return a Todo type");
        }
        expect(data.createTodo.title).toBe(`Concurrent Todo ${index + 1}`);
      });

      // Verify all todos exist
      const todosResult = await client.authenticatedQuery(
        GET_TODOS,
        userSessionCookie
      );

      const todosData = client.getData(todosResult);
      if (todosData?.todos.__typename !== "TodoListResult") {
        throw new Error("Expected todos to return a TodoListResult type");
      }
      expect(todosData.todos.connection?.edges).toHaveLength(5);
    });
  });
});
