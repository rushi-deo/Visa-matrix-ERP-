import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import { getApplication } from "../applications/application.service.js";
import {
  createWorkflowRecord,
  deleteWorkflowRecord,
  executeWorkflowForApplication,
  getWorkflow,
  getWorkflows,
  updateWorkflowRecord,
} from "./workflow.service.js";

export const listWorkflowsController = asyncHandler(async (req, res) => {
  const data = await getWorkflows(req.query);
  return sendSuccess(res, data);
});

export const getWorkflowByIdController = asyncHandler(async (req, res) => {
  const data = await getWorkflow(req.params.id);
  return sendSuccess(res, data);
});

export const createWorkflowController = asyncHandler(async (req, res) => {
  const data = await createWorkflowRecord(req.body);
  return sendCreated(res, data, "Workflow created successfully.");
});

export const updateWorkflowController = asyncHandler(async (req, res) => {
  const data = await updateWorkflowRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Workflow updated successfully.",
  });
});

export const deleteWorkflowController = asyncHandler(async (req, res) => {
  const data = await deleteWorkflowRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Workflow deleted successfully.",
  });
});

export const executeWorkflowController = asyncHandler(async (req, res) => {
  const application = await getApplication(req.params.applicationId);
  const data = await executeWorkflowForApplication({
    triggerKey: req.body.triggerKey || "application_created",
    application,
    authContext: req.auth,
  });

  return sendSuccess(res, data, {
    message: "Workflow executed successfully.",
  });
});
