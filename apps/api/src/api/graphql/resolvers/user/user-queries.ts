import { QueryResolvers } from "@repo/schema";
import {
  createNotFoundError,
  createServerError,
  createUnauthorizedError,
} from "@/utils/errors";
import { withTypename } from "@/utils/with-typename";

export const UserQueries: QueryResolvers = {
  viewer: async (_parent, _args, { prisma, user }) => {
    // Ensure user is authenticated

    if (!user?.id) {
      return createUnauthorizedError("fetch viewer");
    }

    // The viewer is the currently authenticated user
    const viewerId = user.id;

    try {
      const userViewer = await prisma.user.findFirst({
        where: {
          id: viewerId,
        },
      });

      console.log("Fetched user viewer:", userViewer);

      if (!userViewer) {
        return createNotFoundError(viewerId, "User");
      }

      return withTypename(userViewer, "User" as const);
    } catch (error) {
      console.error(`Error fetching user ${viewerId}:`, error);
      return createServerError(
        "Failed to fetch user",
        error instanceof Error ? error.message : String(error)
      );
    }
  },
};
