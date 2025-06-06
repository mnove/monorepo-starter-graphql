import { User, Session } from "@repo/database";

/**
 * Normalizes the auth user object to match Prisma User type.
 * @param authUser
 * @returns
 */
export function normalizeAuthUser(authUser: any): User | null {
  if (!authUser) return null;

  return {
    ...authUser,
    image: authUser.image ?? null, // Convert undefined to null
  };
}

/**
 * Normalizes the auth session object to match Prisma Session type.
 * @param authSession
 * @returns
 */
export function normalizeAuthSession(authSession: any): Session | null {
  if (!authSession?.session) return null;

  const { session } = authSession;

  return {
    id: session.id,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    token: session.token,
    userId: session.userId,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress ?? null, // Convert undefined to null
    userAgent: session.userAgent ?? null, // Convert undefined to null
  };
}
