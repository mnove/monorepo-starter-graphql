import { CategoryResolvers, Todo } from "@repo/schema";
import { GraphQLServerContext } from "@/context";
import { withTypename } from "@/utils/with-typename";
import { createUnauthorizedError } from "@/utils/errors";

export const CategoryFieldResolvers: Pick<
  CategoryResolvers<GraphQLServerContext>,
  "todos"
> = {
  todos: async (parent, _args, { prisma, user }) => {
    // Ensure user is authenticated
    if (!user?.id) {
      return [];
    }

    // If todos are already loaded from the parent
    if (parent.todos) {
      return parent.todos as Todo[];
    }

    // First verify that the category belongs to the user
    const categoryOwnership = await prisma.category.findFirst({
      where: {
        id: parent.id,
        authorId: user.id,
      },
      select: { id: true },
    });

    if (!categoryOwnership) {
      return []; // Return empty list if category doesn't belong to user
    }

    // Otherwise fetch the todos for this category
    const categoryWithTodos = await prisma.category.findUnique({
      where: { id: parent.id },
      include: {
        todos: {
          include: {
            todo: true,
          },
        },
      },
    });

    if (!categoryWithTodos || !categoryWithTodos.todos) {
      return [];
    }

    // Transform the data to match the GraphQL schema
    return categoryWithTodos.todos.map((relation) =>
      withTypename(relation.todo, "Todo" as const)
    ) as Todo[];
  },
};
