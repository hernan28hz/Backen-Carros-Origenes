const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

for (const variableName of requiredVars) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const databaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV || "development";
const smtpSecureValue = String(process.env.SMTP_SECURE || "true").toLowerCase();
const appName = process.env.APP_NAME || "Grupo w logist";
const appUrl = process.env.APP_URL || "https://grupowlogist.com/";

module.exports = {
  nodeEnv,
  appName,
  appUrl,
  port: Number(process.env.PORT || 3000),
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminSeedName: process.env.ADMIN_NAME || "Administrator",
  adminSeedEmail: process.env.ADMIN_EMAIL,
  adminSeedPassword: process.env.ADMIN_PASSWORD,
  smtp: {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: smtpSecureValue === "true" || smtpSecureValue === "1",
    user: process.env.SMTP_USER || "atencion@grupowlogist.com",
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "atencion@grupowlogist.com",
  },
};
