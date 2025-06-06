// import { MutationResolvers } from "@/generated/graphql";
import { MutationResolvers } from "@repo/schema";
import {
  createConflictError,
  createNotFoundError,
  createServerError,
  createUnauthorizedError,
  createValidationError,
} from "@/utils/errors";
import { withTypename } from "@/utils/with-typename";
import { Prisma } from "@repo/database";

import {
  TodoCreateInputSchema,
  TodoUpdateInputSchema,
} from "@repo/validation-schema";
import { ZodError } from "zod";
import { GraphQLServerContext } from "@/context";

export const TodoMutations: MutationResolvers = {
  createTodo: async (_: any, { todo }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("create todo");
    }

    try {
      TodoCreateInputSchema.parse(todo);

      // Check if a todo with the same title already exists for this user
      const existingTodo = await prisma.todo.findFirst({
        where: {
          title: todo.title,
          authorId: user.id,
        },
      });

      if (existingTodo) {
        return createConflictError(
          `A todo with title '${todo.title}' already exists`,
          "title"
        );
      }

      // Prepare categories connection if categoryIds are provided
      const categoriesData = todo.categoryIds?.length
        ? {
            create: todo.categoryIds.map((categoryId) => ({
              category: {
                connect: { id: categoryId },
              },
            })),
          }
        : undefined;

      const newTodo = await prisma.todo.create({
        data: {
          title: todo.title,
          content: todo.content ?? "",
          completed: todo?.completed ?? false,
          dueDate: todo?.dueDate,
          authorId: user.id, // Set the authorId to the current user
          categories: categoriesData,
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      // Transform the data to match the GraphQL schema
      const transformedTodo = {
        ...newTodo,
        categories: newTodo.categories.map((relation) =>
          withTypename(relation.category, "Category" as const)
        ),
      };

      return withTypename(transformedTodo, "Todo" as const);
    } catch (error) {
      console.error("Error creating todo:", error);

      if (error instanceof ZodError) {
        return createValidationError(error);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation
          return createConflictError(
            "A todo with this title already exists",
            "title"
          );
        }
      }

      return createServerError(
        "Failed to create todo",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  updateTodo: async (_parent, { todo }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("update todo");
    }

    try {
      TodoUpdateInputSchema.parse(todo);

      // Check if todo exists first and belongs to the current user
      const existingTodo = await prisma.todo.findFirst({
        where: {
          id: todo.id,
          authorId: user.id, // Ensure the todo belongs to the current user
        },
      });

      if (!existingTodo) {
        return createNotFoundError(todo.id, "Todo");
      }

      // Check for title conflict if title is being updated
      if (todo.title && todo.title !== existingTodo.title) {
        const titleExists = await prisma.todo.findFirst({
          where: {
            title: todo.title,
            id: { not: todo.id },
            authorId: user.id, // Only check conflicts with the user's own todos
          },
        });

        if (titleExists) {
          return createConflictError(
            `A todo with title '${todo.title}' already exists`,
            "title"
          );
        }
      }

      const updateData: any = {};
      if (todo?.title !== undefined) {
        updateData.title = todo.title;
      }
      if (todo?.content !== undefined) {
        updateData.content = todo.content;
      }
      if (todo?.completed !== undefined) {
        updateData.completed = todo.completed;
      }

      if (todo?.dueDate !== undefined) {
        updateData.dueDate = todo.dueDate;
      }

      // Handle category relationships if categoryIds are provided
      if (todo?.categoryIds !== undefined) {
        // Get current category relations
        const currentCategories = await prisma.categoriesOnTodos.findMany({
          where: { todoId: todo.id },
          select: { categoryId: true },
        });

        const currentCategoryIds = currentCategories.map(
          (relation) => relation.categoryId
        );
        const newCategoryIds = todo.categoryIds || [];

        // Find categories to remove (in current but not in new)
        const categoriesToRemove = currentCategoryIds.filter(
          (id) => !newCategoryIds.includes(id)
        );

        // Find categories to add (in new but not in current)
        const categoriesToAdd = newCategoryIds.filter(
          (id) => !currentCategoryIds.includes(id)
        );

        // Remove connections that are no longer needed
        if (categoriesToRemove.length > 0) {
          await prisma.categoriesOnTodos.deleteMany({
            where: {
              todoId: todo.id,
              categoryId: { in: categoriesToRemove },
            },
          });
        }

        // Add new connections
        if (categoriesToAdd.length > 0) {
          updateData.categories = {
            create: categoriesToAdd.map((categoryId) => ({
              category: {
                connect: { id: categoryId },
              },
            })),
          };
        }
      }

      const updatedTodo = await prisma.todo.update({
        where: { id: todo.id },
        data: updateData,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      // Transform the data to match the GraphQL schema
      const transformedTodo = {
        ...updatedTodo,
        categories: updatedTodo.categories.map((relation) =>
          withTypename(relation.category, "Category" as const)
        ),
      };

      return withTypename(transformedTodo, "Todo" as const);
    } catch (error) {
      console.error("Error updating todo:", error);

      if (error instanceof ZodError) {
        return createValidationError(error);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          // Not found error
          return createNotFoundError(todo.id, "Todo");
        }
        if (error.code === "P2002") {
          // Unique constraint violation
          return createConflictError(
            "A todo with this title already exists",
            "title"
          );
        }
      }

      return createServerError(
        "Failed to update todo",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  deleteTodo: async (_parent, { id }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("delete todo");
    }

    try {
      // Check if todo exists first and belongs to the current user
      const todo = await prisma.todo.findFirst({
        where: {
          id,
          authorId: user.id, // Ensure the todo belongs to the current user
        },
      });

      if (!todo) {
        return createNotFoundError(id, "Todo");
      }

      await prisma.todo.delete({
        where: { id },
      });

      return withTypename(todo, "Todo" as const);
    } catch (error) {
      console.error("Error deleting todo:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          // Not found error
          return createNotFoundError(id, "Todo");
        }
      }

      return createServerError(
        "Failed to delete todo",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  // completeTodo: async (_parent, { id }, { prisma }) => {
  //   try {
  //     // Check if todo exists first
  //     const existingTodo = await prisma.todo.findUnique({
  //       where: { id },
  //     });

  //     if (!existingTodo) {
  //       return createNotFoundError(id, "Todo");
  //     }

  //     const updatedTodo = await prisma.todo.update({
  //       where: { id },
  //       data: { completed: true },
  //     });

  //     return withTypename(updatedTodo, "Todo" as const);
  //   } catch (error) {
  //     console.error(`Error completing todo ${id}:`, error);

  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       if (error.code === "P2025") {
  //         // Not found error
  //         return createNotFoundError(id, "Todo");
  //       }
  //     }

  //     return createServerError(
  //       "Failed to complete todo",
  //       error instanceof Error ? error.message : String(error)
  //     );
  //   }
  // },

  bulkDeleteTodos: async (_parent, { ids }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return ids.map(() => createUnauthorizedError("delete todos"));
    }

    const results = [];

    // Process each ID individually to provide detailed results
    for (const id of ids) {
      try {
        // Check if todo exists and belongs to the current user
        const todo = await prisma.todo.findFirst({
          where: {
            id,
            authorId: user.id, // Ensure the todo belongs to the current user
          },
        });

        if (!todo) {
          results.push(createNotFoundError(id, "Todo"));
          continue;
        }

        await prisma.todo.delete({
          where: { id },
        });

        // Return the deleted Todo object with properly typed __typename
        results.push(withTypename(todo, "Todo" as const));
      } catch (error) {
        console.error(`Error deleting todo ${id}:`, error);

        results.push(
          createServerError(
            `Failed to delete todo ${id}`,
            error instanceof Error ? error.message : String(error)
          )
        );
      }
    }

    return results;
  },
};
