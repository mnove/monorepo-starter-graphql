import { DefaultContext } from "@envelop/core";
import { PrismaClient, User, Session } from "@repo/database";

export interface GraphQLServerContext extends DefaultContext {
  prisma: PrismaClient;
  user: User | null;
  session: Session | null;
  req?: any;
  reply?: any;
}
