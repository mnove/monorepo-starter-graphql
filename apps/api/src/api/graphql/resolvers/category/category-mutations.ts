import { MutationResolvers } from "@/generated/graphql";

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
  CategoryCreateInputSchema,
  CategoryUpdateInputSchema,
} from "@repo/validation-schema";
import { ZodError } from "zod";

export const CategoryMutations: MutationResolvers = {
  createCategory: async (_: any, { category }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("create category");
    }

    try {
      CategoryCreateInputSchema.parse(category);

      // Check if a category with the same name already exists for the user
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: category.name,
          authorId: user.id,
        },
      });

      if (existingCategory) {
        return createConflictError(
          `A category with name '${category.name}' already exists`,
          "name"
        );
      }

      const newCategory = await prisma.category.create({
        data: {
          name: category.name,
          description: category.description ?? null,
          color: category.color ?? null,
          authorId: user.id, // Associate with current user
        },
      });
      return withTypename(newCategory, "Category" as const);
    } catch (error) {
      console.error("Error creating category:", error);

      if (error instanceof ZodError) {
        return createValidationError(error);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation
          return createConflictError(
            "A category with this name already exists",
            "name"
          );
        }
      }

      return createServerError(
        "Failed to create category",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  updateCategory: async (_parent, { category }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("update category");
    }

    try {
      CategoryUpdateInputSchema.parse(category);

      // Check if category exists and belongs to the user
      const existingCategory = await prisma.category.findFirst({
        where: {
          id: category.id,
          authorId: user.id,
        },
      });

      if (!existingCategory) {
        return createNotFoundError(category.id, "Category");
      }

      // Check for name conflict if name is being updated
      if (category.name && category.name !== existingCategory.name) {
        const nameExists = await prisma.category.findFirst({
          where: {
            name: category.name,
            authorId: user.id,
          },
        });

        if (nameExists) {
          return createConflictError(
            `A category with name '${category.name}' already exists`,
            "name"
          );
        }
      }

      const updateData: any = {};
      if (category?.name !== undefined) {
        updateData.name = category.name;
      }
      if (category?.description !== undefined) {
        updateData.description = category.description;
      }
      if (category?.color !== undefined) {
        updateData.color = category.color;
      }

      const updatedCategory = await prisma.category.update({
        where: { id: category.id },
        data: updateData,
      });

      return withTypename(updatedCategory, "Category" as const);
    } catch (error) {
      console.error("Error updating category:", error);

      if (error instanceof ZodError) {
        return createValidationError(error);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          // Not found error
          return createNotFoundError(category.id, "Category");
        }
        if (error.code === "P2002") {
          // Unique constraint violation
          return createConflictError(
            "A category with this name already exists",
            "name"
          );
        }
      }

      return createServerError(
        "Failed to update category",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  deleteCategory: async (_parent, { id }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("delete category");
    }

    try {
      // Check if category exists and belongs to the user
      const category = await prisma.category.findFirst({
        where: {
          id,
          authorId: user.id,
        },
      });

      if (!category) {
        return createNotFoundError(id, "Category");
      }

      // Delete the category - cascade will handle removing relations
      await prisma.category.delete({
        where: { id },
      });

      return withTypename(category, "Category" as const);
    } catch (error) {
      console.error("Error deleting category:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          // Not found error
          return createNotFoundError(id, "Category");
        }
      }

      return createServerError(
        "Failed to delete category",
        error instanceof Error ? error.message : String(error)
      );
    }
  },

  bulkDeleteCategories: async (_parent, { ids }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return [createUnauthorizedError("bulk delete categories")];
    }

    const results = [];

    // Process each ID individually to provide detailed results
    for (const id of ids) {
      try {
        // Check if category exists and belongs to the user
        const category = await prisma.category.findFirst({
          where: {
            id,
            authorId: user.id,
          },
        });

        if (!category) {
          results.push(createNotFoundError(id, "Category"));
          continue;
        }

        await prisma.category.delete({
          where: { id },
        });

        results.push(withTypename(category, "Category" as const));
      } catch (error) {
        console.error(`Error deleting category ${id}:`, error);

        results.push(
          createServerError(
            `Failed to delete category ${id}`,
            error instanceof Error ? error.message : String(error)
          )
        );
      }
    }

    return results;
  },
};
