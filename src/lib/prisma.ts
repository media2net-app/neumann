import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Accelerate URL - gebruik environment variable of fallback naar de gegeven URL
const accelerateUrl = process.env.PRISMA_ACCELERATE_URL || 
  "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19HdWIyYXhtanZ1NUd4X0JQSUtneDIiLCJhcGlfa2V5IjoiMDFLQUg1VlJETjhEWDZIUE01QTc4SjJGUlgiLCJ0ZW5hbnRfaWQiOiJkOTlkMDhiNGMyM2NhZjJhOGZkMDZmYjc4NzVkYWIyN2UxN2ZiZTQ4YzQ5NmRhY2I1YTI1NmY5M2E4OWRjNzQyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNDBhNjVmNzctMjJmMC00MjY5LTlmODctMDVkNTNkYjkyMGU2In0.VldrPdx_V3sZ20vKNzNJXAoL7rA1VCSzXyI-2JP3kBU";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

