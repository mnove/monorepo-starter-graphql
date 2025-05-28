import { DefaultContext } from "@envelop/core";
import prisma from "./utils/prisma-client";

export interface GraphQLServerContext extends DefaultContext {
  prisma: typeof prisma;
  user: any | null; // Todo: replace with User type
  session: any | null; // Todo: replace with Session type
  req?: any;
  reply?: any;
}

export const createContext = async (
  contextValue: any
): Promise<GraphQLServerContext> => {
  // Extract user and session from the context passed from the handler
  const { user = null, session = null, req, reply } = contextValue || {};

  return {
    prisma: prisma,
    user,
    session,
    req,
    reply,
  };
};
