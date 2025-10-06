import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  var prisma: PrismaClient | undefined;
}

function safeHost(u?: string) {
  try {
    if (!u) return "";
    const url = new URL(u);
    return url.host;
  } catch {
    return "";
  }
}

function createPrismaClient(): PrismaClient {
  const isProd = process.env.NODE_ENV === "production";
  const dbUrl = process.env.DATABASE_URL;
  const tursoUrl =
    process.env.TURSO_DB_URL ??
    (dbUrl && dbUrl.startsWith("libsql://") ? dbUrl : undefined);
  const tursoToken =
    process.env.TURSO_DB_TOKEN ?? process.env.LIBSQL_AUTH_TOKEN;

  if (!tursoUrl) {
    throw new Error(
      "[prisma] Missing Turso configuration. Set TURSO_DB_URL and TURSO_DB_TOKEN (or DATABASE_URL starting with libsql://). Local file DB is disabled."
    );
  }

  const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
  if (isProd) console.info(`[prisma] Using libSQL adapter: host=${safeHost(tursoUrl)}`);
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
