import { asyncHandler } from "../utils/asyncHandler.js";
import { sendError, sendSuccess } from "../utils/response.js";
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
  const data = await listApplications(req.query);
  return sendSuccess(res, data);
});

export const createApplicationHandler = asyncHandler(async (req, res) => {
  console.log("Incoming Data:", req.body);

  try {
    const payload = validatePayloadBody(req.body);
    const result = await createApplication(payload, req.auth);

    console.log("DB Response:", result);
    return sendSuccess(res, result, 201);
  } catch (error) {
    console.error("ERROR:", error);

    const errorMessage =
      error?.message || "Failed to create application.";
    const errorPayload = {
      code: error?.code || null,
      details: error?.details || null,
      hint: error?.hint || null,
      rls:
        error?.rlsHint ||
        (/row-level security|rls/i.test(errorMessage)
          ? "RLS may be blocking insert. Disable RLS temporarily or add a proper INSERT policy."
          : null),
    };

    return sendError(
      res,
      errorMessage,
      error?.statusCode || 500,
      errorPayload
    );
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
