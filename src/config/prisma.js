const { PrismaClient } = require("@prisma/client");

function appendPoolDefaults(databaseUrl) {
  if (!databaseUrl) return databaseUrl;

  try {
    const parsedUrl = new URL(databaseUrl);
    const isMysql = parsedUrl.protocol === "mysql:";
    if (!isMysql) return databaseUrl;

    if (!parsedUrl.searchParams.has("connection_limit")) {
      parsedUrl.searchParams.set("connection_limit", process.env.DATABASE_CONNECTION_LIMIT || "3");
    }

    if (!parsedUrl.searchParams.has("pool_timeout")) {
      parsedUrl.searchParams.set("pool_timeout", process.env.DATABASE_POOL_TIMEOUT || "10");
    }

    return parsedUrl.toString();
  } catch (_error) {
    return databaseUrl;
  }
}

process.env.DATABASE_URL = appendPoolDefaults(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
