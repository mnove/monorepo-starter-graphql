import { QueryResolvers } from "@/generated/graphql";
import {
  createNotFoundError,
  createServerError,
  createUnauthorizedError,
} from "@/utils/errors";
import { withTypename } from "@/utils/with-typename";

export const CategoryQueries: QueryResolvers = {
  categories: async (_parent, _args, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return {
        items: [],
        totalCount: 0,
        error: createUnauthorizedError("fetch categories"),
        __typename: "CategoryListResult" as const,
      };
    }

    try {
      const items = await prisma.category.findMany({
        where: {
          authorId: user.id, // Only show categories owned by the user
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        items: items.map((item) => withTypename(item, "Category" as const)),
        totalCount: items.length,
        error: null,
        __typename: "CategoryListResult" as const,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        items: [],
        totalCount: 0,
        error: createServerError(
          "Failed to fetch categories",
          error instanceof Error ? error.message : String(error)
        ),
        __typename: "CategoryListResult" as const,
      };
    }
  },

  categoryById: async (_parent, { id }, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return createUnauthorizedError("fetch category");
    }

    try {
      const category = await prisma.category.findFirst({
        where: {
          id,
          authorId: user.id, // Only fetch categories owned by the user
        },
      });

      if (!category) {
        return createNotFoundError(id, "Category");
      }

      return withTypename(category, "Category" as const);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return createServerError(
        "Failed to fetch category",
        error instanceof Error ? error.message : String(error)
      );
    }
  },
};
