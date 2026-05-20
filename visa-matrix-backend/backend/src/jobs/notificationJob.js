import { Queue, Worker } from "bullmq";
import { createRedisConnection, isRedisConfigured } from "../config/redis.js";
import env from "../config/env.js";
import logger from "../core/logger.js";

const queueName = "visa-matrix-notifications";
const queueConnection = isRedisConfigured ? createRedisConnection() : null;

const notificationQueue = queueConnection
  ? new Queue(queueName, {
      connection: queueConnection,
    })
  : null;

export const enqueueNotificationJob = async (payload) => {
  if (!notificationQueue) {
    logger.warn(
      "Notification queue skipped because Redis is not configured.",
      payload
    );
    return null;
  }

  return notificationQueue.add("deliver-notification", payload, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
  });
};

export const startNotificationWorker = () => {
  if (!env.enableInlineWorkers || !isRedisConfigured) {
    return null;
  }

  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info("Processing notification job", {
        jobId: job.id,
        data: job.data,
      });

      return {
        processedAt: new Date().toISOString(),
      };
    },
    {
      connection: createRedisConnection(),
    }
  );

  worker.on("failed", (job, error) => {
    logger.error("Notification job failed", {
      jobId: job?.id,
      error: error.message,
    });
  });

  return worker;
};
