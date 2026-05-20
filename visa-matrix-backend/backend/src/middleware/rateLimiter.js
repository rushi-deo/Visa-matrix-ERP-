import rateLimit from "express-rate-limit";
import env from "../config/env.js";

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const globalRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
});

export const authRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: env.rateLimitWindowMs,
  limit: env.authRateLimitMax,
});
