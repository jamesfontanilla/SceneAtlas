import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

declare global {
  // eslint-disable-next-line no-var
  var __sceneatlasPrisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString });

export const prisma = globalThis.__sceneatlasPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__sceneatlasPrisma = prisma;
}
