import { Queue, Worker } from "bullmq";
import { createRedisConnection, isRedisConfigured } from "../config/redis.js";
import env from "../config/env.js";
import logger from "../core/logger.js";

const queueName = "visa-matrix-workflows";
const queueConnection = isRedisConfigured ? createRedisConnection() : null;

const workflowQueue = queueConnection
  ? new Queue(queueName, {
      connection: queueConnection,
    })
  : null;

export const enqueueWorkflowJob = async (payload) => {
  if (!workflowQueue) {
    logger.warn("Workflow queue skipped because Redis is not configured.", payload);
    return null;
  }

  return workflowQueue.add("process-workflow", payload, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  });
};

export const startWorkflowWorker = () => {
  if (!env.enableInlineWorkers || !isRedisConfigured) {
    return null;
  }

  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info("Processing workflow job", {
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
    logger.error("Workflow job failed", {
      jobId: job?.id,
      error: error.message,
    });
  });

  return worker;
};
