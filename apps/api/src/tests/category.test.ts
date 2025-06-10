import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
} from "./graphql/categories/categoryMutations";
import {
  GET_CATEGORIES,
  GET_CATEGORY_BY_ID,
} from "./graphql/categories/categoryQueries";
import { AuthTestHelper } from "./helpers/auth-helper";
import { TypedGraphQLTestClient } from "./helpers/graphql-client";
import { TestDataFactory } from "./helpers/test-data-factory";
import { TestDatabase } from "./helpers/test-database";
import { createTestServer } from "./helpers/test-server";

describe("Category Integration Tests", () => {
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

  describe("Unauthenticated Category Access", () => {
    it("should reject unauthenticated category creation", async () => {
      client.clearAuth();

      const result = await client.mutate(CREATE_CATEGORY, {
        category: {
          name: "Unauthorized Category",
          description: "This should fail",
        },
      });

      expect(result.status).toBe(401); // Unauthorized
      expect(client.hasErrors(result)).toBe(true);
      const error = client.getFirstError(result);
      expect(error).toContain("User not authenticated");
    });

    it("should reject unauthenticated category queries", async () => {
      client.clearAuth();

      const result = await client.query(GET_CATEGORIES);

      expect(result.status).toBe(401); // Unauthorized
      expect(client.hasErrors(result)).toBe(true);
      const error = client.getFirstError(result);
      expect(error).toContain("User not authenticated");
    });
  });

  describe("Authenticated Category Operations", () => {
    let userSessionCookie: string;
    let userId: string;

    beforeEach(async () => {
      const { sessionCookie, user } = await authHelper.createAuthenticatedUser({
        email: "categoryuser@example.com",
        name: "Category User",
      });
      userSessionCookie = sessionCookie;
      userId = user.id;
    });

    describe("Category Creation", () => {
      it("should create a category successfully", async () => {
        const categoryInput = {
          name: "Work",
          description: "Work-related tasks",
          color: "#FF5733",
        };

        const result = await client.authenticatedMutation(
          CREATE_CATEGORY,
          userSessionCookie,
          { category: categoryInput }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        if (data?.createCategory.__typename !== "Category") {
          throw new Error("Expected createCategory to return a Category type");
        }

        expect(data.createCategory.name).toBe(categoryInput.name);
        expect(data.createCategory.description).toBe(categoryInput.description);
        expect(data.createCategory.color).toBe(categoryInput.color);
        // expect(data.createCategory.authorId).toBe(userId);
        expect(data.createCategory.id).toBeDefined();
        expect(data.createCategory.createdAt).toBeDefined();
      });

      it("should create a category with minimal data", async () => {
        const categoryInput = {
          name: "Personal",
        };

        const result = await client.authenticatedMutation(
          CREATE_CATEGORY,
          userSessionCookie,
          { category: categoryInput }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        if (data?.createCategory.__typename !== "Category") {
          throw new Error("Expected createCategory to return a Category type");
        }

        expect(data.createCategory.name).toBe(categoryInput.name);
        expect(data.createCategory.description).toBeNull();
        expect(data.createCategory.color).toBeNull();
        // expect(data.createCategory.authorId).toBe(userId);
      });

      it("should reject category creation with invalid input", async () => {
        const invalidInput = {
          name: "", // Empty name should be invalid
          description: "Invalid category",
        };

        const result = await client.authenticatedMutation(
          CREATE_CATEGORY,
          userSessionCookie,
          { category: invalidInput }
        );

        expect(client.hasErrors(result)).toBe(true);
      });
    });

    describe("Category Querying", () => {
      beforeEach(async () => {
        // Create some test categories
        await dataFactory.createMultipleCategories(userId, 3, {
          name: "Test Category",
        });
      });

      it("should fetch all user categories", async () => {
        const result = await client.authenticatedQuery(
          GET_CATEGORIES,
          userSessionCookie
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);
        if (data?.categories.__typename !== "CategoryListResult") {
          throw new Error(
            "Expected categories to return a CategoryListResult type"
          );
        }

        expect(data.categories).toBeDefined();
        expect(data.categories.items).toBeDefined();
        expect(data.categories.items).toHaveLength(3);
        data.categories?.items?.forEach((category) => {
          // expect(category.authorId).toBe(userId);
          expect(category?.name).toContain("Test Category");
        });
      });

      it("should fetch specific category by ID", async () => {
        const createdCategory = await dataFactory.createCategory(userId, {
          name: "Specific Category",
          description: "This is a specific category",
          color: "#00FF00",
        });

        const result = await client.authenticatedQuery(
          GET_CATEGORY_BY_ID,
          userSessionCookie,
          { categoryByIdId: createdCategory.id }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        if (data?.categoryById.__typename !== "Category") {
          throw new Error("Expected categoryById to return a Category type");
        }

        expect(data.categoryById.id).toBe(createdCategory.id);
        expect(data.categoryById.name).toBe("Specific Category");
        expect(data.categoryById.description).toBe(
          "This is a specific category"
        );
        expect(data.categoryById.color).toBe("#00FF00");
      });

      it("should return null for non-existent category", async () => {
        const result = await client.authenticatedQuery(
          GET_CATEGORY_BY_ID,
          userSessionCookie,
          { categoryByIdId: "non-existent-id" }
        );

        expect(client.hasErrors(result)).toBe(true);
        const data = client.getData(result);

        if (data?.categoryById.__typename !== "NotFoundError") {
          throw new Error(
            "Expected categoryById to return a NotFoundError type"
          );
        }
        expect(data.categoryById.__typename).toBe("NotFoundError");
      });
    });

    describe("Category Updates", () => {
      let testCategory: any;

      beforeEach(async () => {
        testCategory = await dataFactory.createCategory(userId, {
          name: "Original Name",
          description: "Original description",
          color: "#FF0000",
        });
      });

      it("should update category details", async () => {
        const updateInput = {
          name: "Updated Name",
          description: "Updated description",
          color: "#00FF00",
          id: testCategory.id,
        };

        const result = await client.authenticatedMutation(
          UPDATE_CATEGORY,
          userSessionCookie,
          { category: updateInput }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        if (data?.updateCategory.__typename !== "Category") {
          throw new Error("Expected updateCategory to return a Category type");
        }

        expect(data.updateCategory.id).toBe(testCategory.id);
        expect(data.updateCategory.name).toBe(updateInput.name);
        expect(data.updateCategory.description).toBe(updateInput.description);
        expect(data.updateCategory.color).toBe(updateInput.color);
        expect(data.updateCategory.updatedAt).not.toBe(testCategory.updatedAt);
      });

      it("should update category partially", async () => {
        const updateInput = {
          name: "Partially Updated",
          id: testCategory.id,
        };

        const result = await client.authenticatedMutation(
          UPDATE_CATEGORY,
          userSessionCookie,
          { category: updateInput }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        if (data?.updateCategory.__typename !== "Category") {
          throw new Error("Expected updateCategory to return a Category type");
        }

        expect(data.updateCategory.name).toBe(updateInput.name);
        // Other fields should remain unchanged
        expect(data.updateCategory.description).toBe(testCategory.description);
        expect(data.updateCategory.color).toBe(testCategory.color);
      });

      it("should reject updates to non-existent category", async () => {
        const result = await client.authenticatedMutation(
          UPDATE_CATEGORY,
          userSessionCookie,
          {
            category: { id: "non-existent-id", name: "New Name" },
          }
        );

        expect(client.hasErrors(result)).toBe(true);
      });
    });

    describe("Category Deletion", () => {
      let testCategory: any;

      beforeEach(async () => {
        testCategory = await dataFactory.createCategory(userId, {
          name: "Category to Delete",
          description: "This category will be deleted",
        });
      });

      it("should delete category successfully", async () => {
        const result = await client.authenticatedMutation(
          DELETE_CATEGORY,
          userSessionCookie,
          { deleteCategoryId: testCategory.id }
        );

        expect(client.hasErrors(result)).toBe(false);
        const data = client.getData(result);

        if (data?.deleteCategory.__typename !== "Category") {
          throw new Error("Expected deleteCategory to return a Category type");
        }
        expect(data.deleteCategory.id).toBe(testCategory.id);

        // Verify category is actually deleted
        const fetchResult = await client.authenticatedQuery(
          GET_CATEGORY_BY_ID,
          userSessionCookie,
          { categoryByIdId: testCategory.id }
        );
        expect(client.hasErrors(fetchResult)).toBe(true);

        const fetchData = client.getData(fetchResult);
        if (fetchData?.categoryById.__typename !== "NotFoundError") {
          throw new Error("Expected category to return a NotFoundError type");
        }
        expect(fetchData.categoryById.__typename).toBe("NotFoundError");
      });

      it("should reject deletion of non-existent category", async () => {
        const result = await client.authenticatedMutation(
          DELETE_CATEGORY,
          userSessionCookie,
          { deleteCategoryId: "non-existent-id" }
        );

        expect(client.hasErrors(result)).toBe(true);
        const data = client.getData(result);
        if (data?.deleteCategory.__typename !== "NotFoundError") {
          throw new Error(
            "Expected deleteCategory to return a NotFoundError type"
          );
        }
        expect(data.deleteCategory.__typename).toBe("NotFoundError");
      });
    });
  });

  describe("Category-Todo Relationships", () => {
    let userSessionCookie: string;
    let userId: string;

    beforeEach(async () => {
      const { sessionCookie, user } = await authHelper.createAuthenticatedUser({
        email: "relationuser@example.com",
        name: "Relation User",
      });
      userSessionCookie = sessionCookie;
      userId = user.id;
    });

    // Skip this test
    it.skip("should show todos associated with category", async () => {
      // Create a todo with categories
      const todoWithCategories = await dataFactory.createTodoWithCategories(
        userId,
        { title: "Categorized Todo" },
        ["Work", "Urgent"]
      );

      // Fetch categories and verify todos are associated
      const result = await client.authenticatedQuery(
        GET_CATEGORIES,
        userSessionCookie
      );

      expect(client.hasErrors(result)).toBe(false);
      const data = client.getData(result);

      if (data?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }

      expect(data.categories.items).toBeDefined();

      // Each category should have the todo associated
      data.categories.items?.forEach((category) => {
        expect(category?.todos).toHaveLength(1);

        // Get from todoWithCategories the associated todo
        const associatedTodoId = todoWithCategories?.categories.find(
          (cat: any) => cat.category.id === category?.id
        )?.todoId;

        expect(category?.id).toBe(associatedTodoId);
        expect(category?.name).toBe(
          todoWithCategories?.categories.find(
            (cat: any) => cat.category.id === category?.id
          )?.category.name
        );
      });
    });

    it("should handle categories with no todos", async () => {
      // Create categories without todos
      await dataFactory.createMultipleCategories(userId, 2, {
        name: "Empty Category",
      });

      const result = await client.authenticatedQuery(
        GET_CATEGORIES,
        userSessionCookie
      );

      expect(client.hasErrors(result)).toBe(false);
      const data = client.getData(result);

      if (data?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }

      expect(data.categories.items).toHaveLength(2);
      data.categories.items?.forEach((category: any) => {
        expect(category.todos).toHaveLength(0);
        expect(category.name).toContain("Empty Category");
      });
    });
  });

  describe("User Isolation for Categories", () => {
    let user1SessionCookie: string;
    let user2SessionCookie: string;
    let user1Id: string;
    let user2Id: string;

    beforeEach(async () => {
      const user1 = await authHelper.createAuthenticatedUser({
        email: "catuser1@example.com",
        name: "Category User One",
      });

      const user2 = await authHelper.createAuthenticatedUser({
        email: "catuser2@example.com",
        name: "Category User Two",
      });

      user1SessionCookie = user1.sessionCookie;
      user2SessionCookie = user2.sessionCookie;
      user1Id = user1.user.id;
      user2Id = user2.user.id;
    });

    it("should isolate categories between users", async () => {
      // User 1 creates categories
      await dataFactory.createMultipleCategories(user1Id, 2, {
        name: "User 1 Category",
      });

      // User 2 creates categories
      await dataFactory.createMultipleCategories(user2Id, 3, {
        name: "User 2 Category",
      });

      // User 1 should only see their categories
      const user1Result = await client.authenticatedQuery(
        GET_CATEGORIES,
        user1SessionCookie
      );

      expect(client.hasErrors(user1Result)).toBe(false);
      const user1Data = client.getData(user1Result);

      if (user1Data?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }

      expect(user1Data.categories.items).toHaveLength(2);
      user1Data.categories.items?.forEach((category: any) => {
        // expect(category.authorId).toBe(user1Id);

        expect(category.name).toContain("User 1 Category");
      });

      // User 2 should only see their categories
      const user2Result = await client.authenticatedQuery(
        GET_CATEGORIES,
        user2SessionCookie
      );

      expect(client.hasErrors(user2Result)).toBe(false);
      const user2Data = client.getData(user2Result);
      if (user2Data?.categories.__typename !== "CategoryListResult") {
        throw new Error(
          "Expected categories to return a CategoryListResult type"
        );
      }

      expect(user2Data.categories.items).toHaveLength(3);
      user2Data.categories.items?.forEach((category: any) => {
        // expect(category.authorId).toBe(user2Id);
        expect(category.name).toContain("User 2 Category");
      });
    });

    it("should prevent users from accessing other users categories", async () => {
      // User 1 creates a category
      const user1Category = await dataFactory.createCategory(user1Id, {
        name: "Private Category",
      });

      // User 2 tries to access User 1's category
      const result = await client.authenticatedQuery(
        GET_CATEGORY_BY_ID,
        user2SessionCookie,
        { categoryByIdId: user1Category.id }
      );

      expect(client.hasErrors(result)).toBe(true);
      const data = client.getData(result);
      if (data?.categoryById.__typename !== "NotFoundError") {
        throw new Error("Expected categoryById to return a NotFoundError type");
      }
      expect(data.categoryById.__typename).toBe("NotFoundError");
    });

    it("should prevent users from updating other users categories", async () => {
      // User 1 creates a category
      const user1Category = await dataFactory.createCategory(user1Id, {
        name: "Original Name",
      });

      // User 2 tries to update User 1's category
      const result = await client.authenticatedMutation(
        UPDATE_CATEGORY,
        user2SessionCookie,
        {
          category: { name: "Hacked Name", id: user1Category.id },
        }
      );

      expect(client.hasErrors(result)).toBe(true);
      const data = client.getData(result);
      if (data?.updateCategory.__typename !== "NotFoundError") {
        throw new Error(
          "Expected updateCategory to return a NotFoundError type"
        );
      }
      expect(data.updateCategory.__typename).toBe("NotFoundError");
    });
  });
});
