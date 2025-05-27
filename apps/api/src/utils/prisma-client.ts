import { PrismaClient } from "../../generated/prisma-client";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Add connection error handling
prisma
  .$connect()
  .then(() => {
    console.log("Successfully connected to database");
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });

export default prisma;
