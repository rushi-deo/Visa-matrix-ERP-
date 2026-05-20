import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createApplicationRecord,
  deleteApplicationRecord,
  getApplication,
  getApplications,
  updateApplicationRecord,
} from "./application.service.js";

export const listApplicationsController = asyncHandler(async (req, res) => {
  const data = await getApplications(req.query);
  return sendSuccess(res, data);
});

export const getApplicationByIdController = asyncHandler(async (req, res) => {
  const data = await getApplication(req.params.id, req.auth);
  return sendSuccess(res, data);
});

export const createApplicationController = asyncHandler(async (req, res) => {
  const data = await createApplicationRecord(req.body, req.auth);
  return sendCreated(res, data, "Application created successfully.");
});

export const updateApplicationController = asyncHandler(async (req, res) => {
  const data = await updateApplicationRecord(req.params.id, req.body, req.auth);
  return sendSuccess(res, data, {
    message: "Application updated successfully.",
  });
});

export const deleteApplicationController = asyncHandler(async (req, res) => {
  const data = await deleteApplicationRecord(req.params.id, req.auth);
  return sendSuccess(res, data, {
    message: "Application deleted successfully.",
  });
});
