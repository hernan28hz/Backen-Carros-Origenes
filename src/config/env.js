const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

for (const variableName of requiredVars) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminSeedName: process.env.ADMIN_NAME || "Administrator",
  adminSeedEmail: process.env.ADMIN_EMAIL,
  adminSeedPassword: process.env.ADMIN_PASSWORD,
};
