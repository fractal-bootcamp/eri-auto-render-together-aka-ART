import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, closing database connections...`);
      await client.$disconnect();
      process.exit(0);
    });
  });

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
