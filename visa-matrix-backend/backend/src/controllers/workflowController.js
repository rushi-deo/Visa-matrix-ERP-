import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createWorkflow,
  listWorkflows,
  updateWorkflow,
} from "../services/workflowService.js";
import {
  validateIdParam,
  validateWorkflowPayload,
} from "../validators/moduleValidators.js";

export const getWorkflows = asyncHandler(async (req, res) => {
  const data = await listWorkflows(req.query);
  return sendSuccess(res, data);
});

export const createWorkflowHandler = asyncHandler(async (req, res) => {
  const payload = validateWorkflowPayload(req.body);
  const data = await createWorkflow(payload);
  return sendSuccess(res, data, 201);
});

export const updateWorkflowHandler = asyncHandler(async (req, res) => {
  validateIdParam(req.params.id);
  const payload = validateWorkflowPayload(req.body, { partial: true });
  const data = await updateWorkflow(req.params.id, payload);
  return sendSuccess(res, data);
});
