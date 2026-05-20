import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(configDirectory, "../../.env");

dotenv.config({ path: envPath });

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseList = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInteger(process.env.PORT, 5000),
  apiPrefix: process.env.API_PREFIX || "/api",
  appName: process.env.APP_NAME || "Visa Matrix ERP API",
  baseUrl: process.env.BASE_URL || "http://localhost:5000",
  corsOrigins: parseList(process.env.CORS_ORIGIN, ["*"]),
  requestSizeLimit: process.env.REQUEST_SIZE_LIMIT || "10mb",
  logLevel: process.env.LOG_LEVEL || "info",
  jwtSecret: process.env.JWT_SECRET || process.env.APP_JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || "visa-documents",
  uploadsMaxFileSizeBytes: parseInteger(
    process.env.UPLOAD_MAX_FILE_SIZE_BYTES,
    10 * 1024 * 1024
  ),
  rateLimitWindowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: parseInteger(process.env.RATE_LIMIT_MAX, 300),
  authRateLimitMax: parseInteger(process.env.AUTH_RATE_LIMIT_MAX, 30),
  redisUrl: process.env.REDIS_URL || null,
  redisHost: process.env.REDIS_HOST || null,
  redisPort: parseInteger(process.env.REDIS_PORT, 6379),
  redisPassword: process.env.REDIS_PASSWORD || null,
  enableInlineWorkers: process.env.ENABLE_INLINE_WORKERS !== "false",
  emailFrom: process.env.EMAIL_FROM || "noreply@visamatrix.local",
};

const missing = [];

if (!env.supabaseUrl) {
  missing.push("SUPABASE_URL");
}

if (!env.supabaseServiceRoleKey) {
  missing.push("SUPABASE_SERVICE_ROLE_KEY");
}

if (!env.jwtSecret) {
  missing.push("JWT_SECRET");
}

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}.`
  );
}

export default Object.freeze(env);
