import { enqueueWorkflowJob } from "../../jobs/workflowJob.js";
import logger from "../../core/logger.js";
import { emitSystemNotification } from "../notifications/notification.service.js";
import { createTaskRecord } from "../tasks/task.service.js";
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowById,
  listWorkflowStepsByTrigger,
  listWorkflows,
  updateWorkflow,
} from "./workflow.repository.js";

const defaultSteps = [
  {
    step_type: "create_task",
  },
  {
    step_type: "notify_agent",
  },
  {
    step_type: "request_documents",
  },
];

const executeStep = async (step, application, authContext) => {
  switch (step.step_type) {
    case "create_task":
      await createTaskRecord({
        application_id: application.id,
        title: "Process visa application",
        description:
          "Review the application, verify documents, and continue the workflow.",
        assigned_to: authContext.userId || null,
        status: "open",
        priority: "high",
      });
      break;

    case "notify_agent":
      await emitSystemNotification({
        userId: authContext.userId || null,
        applicationId: application.id,
        type: "workflow_notification",
        title: "Workflow action: notify agent",
        message: `Application ${application.id} requires agent action.`,
        channel: "in_app",
      });
      break;

    case "request_documents":
      await emitSystemNotification({
        userId: authContext.userId || null,
        applicationId: application.id,
        type: "documents_requested",
        title: "Documents requested",
        message: `Additional documents may be required for application ${application.id}.`,
        channel: "email",
      });
      break;

    default:
      break;
  }
};

export const getWorkflows = async (query) => listWorkflows(query);
export const getWorkflow = async (id) => getWorkflowById(id);
export const createWorkflowRecord = async (payload) => createWorkflow(payload);
export const updateWorkflowRecord = async (id, payload) => updateWorkflow(id, payload);
export const deleteWorkflowRecord = async (id) => deleteWorkflow(id);

export const executeWorkflowForApplication = async ({
  triggerKey = "application_created",
  application,
  authContext = {},
}) => {
  const configuredSteps = await listWorkflowStepsByTrigger(triggerKey);
  const stepsToExecute = configuredSteps.length ? configuredSteps : defaultSteps;

  for (const step of stepsToExecute) {
    await executeStep(step, application, authContext);
  }

  const job = await enqueueWorkflowJob({
    triggerKey,
    applicationId: application.id,
  });

  logger.info("Workflow executed for application", {
    triggerKey,
    applicationId: application.id,
    stepsExecuted: stepsToExecute.length,
    jobId: job?.id || null,
  });

  return {
    triggerKey,
    applicationId: application.id,
    stepsExecuted: stepsToExecute.length,
  };
};
