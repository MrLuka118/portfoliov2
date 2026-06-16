import { PrismaClient } from "@prisma/client";

/**
 * Enotna instanca Prisma klienta.
 * V razvoju shranimo na globalni objekt, da hot-reload ne ustvarja novih povezav.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
