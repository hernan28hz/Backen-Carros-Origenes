const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

function toPositiveNumber(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function buildMariaDbConfig(databaseUrl) {
  if (!databaseUrl) return databaseUrl;

  try {
    const parsedUrl = new URL(databaseUrl);
    const isMysql = parsedUrl.protocol === "mysql:" || parsedUrl.protocol === "mariadb:";
    if (!isMysql) return databaseUrl;

    const connectionLimit = toPositiveNumber(
      parsedUrl.searchParams.get("connectionLimit") ||
        parsedUrl.searchParams.get("connection_limit") ||
        process.env.DATABASE_CONNECTION_LIMIT,
      3
    );

    const acquireTimeoutSeconds = toPositiveNumber(
      parsedUrl.searchParams.get("pool_timeout") || process.env.DATABASE_POOL_TIMEOUT,
      10
    );

    return {
      host: parsedUrl.hostname,
      port: toPositiveNumber(parsedUrl.port, 3306),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      database: decodeURIComponent(parsedUrl.pathname.replace(/^\//, "")),
      connectionLimit,
      acquireTimeout: acquireTimeoutSeconds * 1000,
    };
  } catch (_error) {
    return databaseUrl;
  }
}

const databaseConfig = buildMariaDbConfig(process.env.DATABASE_URL);
const adapterOptions =
  databaseConfig && typeof databaseConfig === "object" && databaseConfig.database
    ? { database: databaseConfig.database }
    : undefined;

const adapter = new PrismaMariaDb(databaseConfig, adapterOptions);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
