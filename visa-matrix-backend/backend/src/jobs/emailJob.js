import { Queue, Worker } from "bullmq";
import { createRedisConnection, isRedisConfigured } from "../config/redis.js";
import env from "../config/env.js";
import logger from "../core/logger.js";

const queueName = "visa-matrix-email";
const queueConnection = isRedisConfigured ? createRedisConnection() : null;

const emailQueue = queueConnection
  ? new Queue(queueName, {
      connection: queueConnection,
    })
  : null;

export const enqueueEmailJob = async (payload) => {
  if (!emailQueue) {
    logger.warn("Email queue skipped because Redis is not configured.", payload);
    return null;
  }

  return emailQueue.add("send-email", payload, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  });
};

export const startEmailWorker = () => {
  if (!env.enableInlineWorkers || !isRedisConfigured) {
    return null;
  }

  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info("Processing email job", {
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
    logger.error("Email job failed", {
      jobId: job?.id,
      error: error.message,
    });
  });

  return worker;
};
