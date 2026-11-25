import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  listApplications,
  updateApplication,
} from "../services/applicationService.js";
import {
  validatePayloadBody,
  validateResourceId,
} from "../validators/requestValidators.js";

export const getApplications = asyncHandler(async (req, res) => {
  const data = await listApplications(req.query, req.auth);
  return sendSuccess(res, data);
});

export const createApplicationHandler = asyncHandler(async (req, res) => {
  try {
    const payload = validatePayloadBody(req.body);
    const result = await createApplication(payload, req.auth);

    return sendSuccess(res, result, 201);
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    const message = statusCode < 500
      ? error.message
      : "Application request failed.";
    return res.status(statusCode).json({
      success: false,
      message,
      error: null,
      requestId: req.requestId || null,
      correlationId: req.correlationId || null,
    });
  }
});

export const getApplicationByIdHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await getApplicationById(id, req.auth);
  return sendSuccess(res, data);
});

export const updateApplicationHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const payload = validatePayloadBody(req.body);
  const data = await updateApplication(id, payload, req.auth);
  return sendSuccess(res, data);
});

export const deleteApplicationHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await deleteApplication(id, req.auth);
  return sendSuccess(res, data);
});
