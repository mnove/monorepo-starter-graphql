import { Category, TodoResolvers } from "@repo/schema";
import { GraphQLServerContext } from "@/context";
import { withTypename } from "@/utils/with-typename";

export const TodoFieldResolvers: Pick<
  TodoResolvers<GraphQLServerContext>,
  "categories"
> = {
  categories: async (parent, _args, { prisma, user }) => {
    // If categories are already loaded from the parent
    if (parent.categories) {
      return parent.categories as Category[];
    }

    // Otherwise fetch the categories for this todo, but only if it belongs to the current user
    const todoWithCategories = await prisma.todo.findFirst({
      where: {
        id: parent.id,
        authorId: user?.id, // Only fetch if the todo belongs to the current user
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!todoWithCategories || !todoWithCategories.categories) {
      return [];
    }

    // Transform the data to match the GraphQL schema
    return todoWithCategories.categories.map((relation) =>
      withTypename(relation.category, "Category" as const)
    ) as Category[];
  },
};
