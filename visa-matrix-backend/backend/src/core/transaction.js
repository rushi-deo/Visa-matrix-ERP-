import logger from "./logger.js";

export const createRollbackTransaction = () => {
  const rollbackSteps = [];

  const addRollback = (label, handler) => {
    rollbackSteps.unshift({ label, handler });
  };

  const rollback = async (cause) => {
    for (const step of rollbackSteps) {
      try {
        await step.handler();
      } catch (error) {
        logger.error("Rollback step failed", {
          step: step.label,
          cause: cause?.message || null,
          error: error.message,
        });
      }
    }
  };

  return {
    addRollback,
    rollback,
  };
};
