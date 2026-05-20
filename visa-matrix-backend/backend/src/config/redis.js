import IORedis from "ioredis";
import env from "./env.js";

export const isRedisConfigured = Boolean(env.redisUrl || env.redisHost);

export const createRedisConnection = () => {
  if (!isRedisConfigured) {
    return null;
  }

  if (env.redisUrl) {
    return new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return new IORedis({
    host: env.redisHost,
    port: env.redisPort,
    password: env.redisPassword || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
};
