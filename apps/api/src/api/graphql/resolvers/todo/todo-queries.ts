import { QueryResolvers } from "@repo/schema";
import { createNotFoundError, createServerError } from "@/utils/errors";
import { withTypename } from "@/utils/with-typename";
import { Prisma } from "@repo/database";

// Helper function to encode cursor
const encodeCursor = (id: string, date: Date): string => {
  // Use ISO string format and ensure date is valid
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    // Fallback to current date if date is invalid
    date = new Date();
  }

  // Create cursor with timestamp (as number) instead of string format to avoid parsing issues
  const timestamp = date.getTime();
  return Buffer.from(`${id}:${timestamp}`).toString("base64");
};

// Helper function to decode cursor
const decodeCursor = (cursor: string): { id: string; date: Date } | null => {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const [id, timestampStr] = decoded.split(":");

    // Parse timestamp as number and create date
    const timestamp = parseInt(timestampStr, 10);

    // Validate timestamp is a valid number
    if (isNaN(timestamp)) {
      console.error("Invalid timestamp in cursor:", timestampStr);
      return null;
    }

    const date = new Date(timestamp);

    // Final validation of the date
    if (isNaN(date.getTime())) {
      console.error("Invalid date from timestamp:", timestamp);
      return null;
    }

    return { id, date };
  } catch (e) {
    console.error("Error decoding cursor:", e);
    return null;
  }
};

export const TodoQueries: QueryResolvers = {
  todos: async (_parent, args, ctx) => {
    const { first, after, last, before, filter } = args;

    // Validate pagination arguments
    const isForwardPagination = first !== undefined && first !== null;
    const isBackwardPagination = last !== undefined && last !== null;

    if (isForwardPagination && isBackwardPagination) {
      throw new Error("Cannot specify both first and last");
    }

    // Default to forward pagination if neither is specified
    const limit = isBackwardPagination ? (last as number) : (first ?? 10);

    try {
      // Build where conditions
      let where: Prisma.TodoWhereInput = {
        authorId: ctx.user?.id,
      };

      // Apply cursor-based conditions
      if (after) {
        const afterCursor = decodeCursor(after);

        console.log("afterCursor", afterCursor);
        if (afterCursor) {
          where = {
            ...where,
            OR: [
              {
                createdAt: { lt: afterCursor.date },
              },
              {
                createdAt: { equals: afterCursor.date },
                id: { gt: afterCursor.id },
              },
            ],
          };
        }
      }

      if (before) {
        const beforeCursor = decodeCursor(before);
        if (beforeCursor) {
          where = {
            ...where,
            OR: [
              {
                createdAt: { gt: beforeCursor.date },
              },
              {
                createdAt: { equals: beforeCursor.date },
                id: { lt: beforeCursor.id },
              },
            ],
          };
        }
      }

      // Apply additional filters
      if (filter) {
        if (filter.title) {
          where.title = { contains: filter.title, mode: "insensitive" };
        }
        if (filter.completed !== undefined && filter.completed !== null) {
          where.completed = filter.completed;
        }
        if (filter.categoryIds && filter.categoryIds.length > 0) {
          where.categories = {
            some: {
              categoryId: { in: filter.categoryIds },
            },
          };
        }
      }

      // Get one more item than requested to check if there are more pages
      const items = await ctx.prisma.todo.findMany({
        where,
        orderBy: isBackwardPagination
          ? [{ createdAt: "asc" }, { id: "asc" }]
          : [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });

      // Check if there are more items
      const hasMore = items.length > limit;
      const paginatedItems = hasMore ? items.slice(0, limit) : items;

      // For backward pagination, reverse the items to display them in the correct order
      const finalItems = isBackwardPagination
        ? paginatedItems.reverse()
        : paginatedItems;

      // Build edges
      const edges = finalItems.map((item) => ({
        cursor: encodeCursor(item.id, item.createdAt),
        node: withTypename(item, "Todo" as const),
      }));

      // Get total count (Note: this is a separate query that might be expensive)
      const totalCount = await ctx.prisma.todo.count({
        where: { authorId: ctx.user?.id },
      });

      // Build page info
      const pageInfo = {
        /*
         * For hasNextPage:
         * - In forward pagination: hasMore indicates there are more items ahead
         * - In backward pagination: we need to track if we came from a "next page"
         *   (which means there's more ahead when going backwards)
         */
        hasNextPage: isForwardPagination ? hasMore : Boolean(before),

        /*
         * For hasPreviousPage:
         * - In backward pagination: hasMore indicates there are more items behind
         * - In forward pagination: if we have an "after" cursor, we came from somewhere
         *   and can go back
         */
        hasPreviousPage: isBackwardPagination ? hasMore : Boolean(after),

        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      };

      return {
        connection: {
          edges,
          pageInfo,
          totalCount,
        },
        error: null,
        __typename: "TodoListResult" as const,
      };
    } catch (error) {
      console.error("Error fetching todos:", error);
      return {
        connection: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        error: createServerError(
          "Failed to fetch todos",
          error instanceof Error ? error.message : String(error)
        ),
        __typename: "TodoListResult" as const,
      };
    }
  },

  todoById: async (_parent, { id }, { prisma, user }) => {
    // If no user is authenticated, return not found immediately
    if (!user?.id) {
      return createNotFoundError(id, "Todo");
    }

    try {
      // Use findFirst instead of findUnique to filter by both id and authorId
      const todo = await prisma.todo.findFirst({
        where: {
          id,
          authorId: user.id, // Ensure the todo belongs to the current user
        },
      });

      if (!todo) {
        return createNotFoundError(id, "Todo");
      }

      return withTypename(todo, "Todo" as const);
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      return createServerError(
        "Failed to fetch todo",
        error instanceof Error ? error.message : String(error)
      );
    }
  },
};
