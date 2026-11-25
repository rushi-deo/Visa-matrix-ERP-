import { enqueueWorkflowJob } from "../../jobs/workflowJob.js";
import logger from "../../core/logger.js";
import { emitSystemNotification } from "../notifications/notification.service.js";
import { createTaskRecord } from "../tasks/task.service.js";
import { getApplication } from "../applications/application.service.js";
import { ForbiddenError } from "../../core/errors.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../../utils/tenantSecurity.js";
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
      }, authContext);
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

const assertWorkflowApplicationOwnership = async (workflow, authContext) => {
  assertTenantAccess(workflow, authContext, "workflow");
  if (workflow.application_id) {
    const application = await getApplication(workflow.application_id, authContext);
    if (String(application.organization_id) !== String(workflow.organization_id)) {
      throw new ForbiddenError("Workflow organization does not match its application.");
    }
  }
  return workflow;
};

export const getWorkflows = async (query = {}, authContext = {}) => {
  const result = await listWorkflows(query, getTenantOrganizationScope(authContext));
  const items = await Promise.all((result.items || []).map((workflow) =>
    assertWorkflowApplicationOwnership(workflow, authContext),
  ));
  return { ...result, items };
};
export const getWorkflow = async (id, authContext = {}) => {
  const workflow = await getWorkflowById(id, getTenantOrganizationScope(authContext));
  return assertWorkflowApplicationOwnership(workflow, authContext);
};
export const createWorkflowRecord = async (payload, authContext = {}) => {
  let organizationId = payload.organization_id;
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    organizationId = application.organization_id;
  }
  return createWorkflow(applyTenantToPayload({
    ...payload,
    ...(organizationId ? { organization_id: organizationId } : {}),
  }, authContext));
};
export const updateWorkflowRecord = async (id, payload, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getWorkflowById(id, organizationId);
  await assertWorkflowApplicationOwnership(current, authContext);
  if (payload.application_id) {
    const application = await getApplication(payload.application_id, authContext);
    if (String(application.organization_id) !== String(current.organization_id)) {
      throw new ForbiddenError("Workflow application must belong to the workflow organization.");
    }
  }
  return updateWorkflow(id, applyTenantToPayload({
    ...payload,
    organization_id: current.organization_id,
  }, authContext), organizationId);
};
export const deleteWorkflowRecord = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  const current = await getWorkflowById(id, organizationId);
  await assertWorkflowApplicationOwnership(current, authContext);
  return deleteWorkflow(id, organizationId);
};

export const executeWorkflowForApplication = async ({
  triggerKey = "application_created",
  application,
  authContext = {},
}) => {
  assertTenantAccess(application, authContext, "application");
  const configuredSteps = await listWorkflowStepsByTrigger(
    triggerKey,
    application.organization_id,
  );
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
