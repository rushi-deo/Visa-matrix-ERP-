import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createVisaType,
  deleteVisaType,
  getVisaTypeById,
  listVisaTypes,
  updateVisaType,
} from "../services/visaTypeService.js";
import {
  validatePayloadBody,
  validateResourceId,
} from "../validators/requestValidators.js";

export const getVisaTypes = asyncHandler(async (req, res) => {
  const data = await listVisaTypes(req.query);
  return sendSuccess(res, data);
});

export const createVisaTypeHandler = asyncHandler(async (req, res) => {
  const payload = validatePayloadBody(req.body);
  const data = await createVisaType(payload);
  return sendSuccess(res, data, 201);
});

export const getVisaTypeByIdHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await getVisaTypeById(id);
  return sendSuccess(res, data);
});

export const updateVisaTypeHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const payload = validatePayloadBody(req.body);
  const data = await updateVisaType(id, payload);
  return sendSuccess(res, data);
});

export const deleteVisaTypeHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await deleteVisaType(id);
  return sendSuccess(res, data);
});
