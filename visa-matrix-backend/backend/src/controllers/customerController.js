import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "../services/customerService.js";
import {
  validatePayloadBody,
  validateResourceId,
} from "../validators/requestValidators.js";

export const getCustomers = asyncHandler(async (req, res) => {
  const data = await listCustomers(req.query);
  return sendSuccess(res, data);
});

export const createCustomerHandler = asyncHandler(async (req, res) => {
  const payload = validatePayloadBody(req.body);
  const data = await createCustomer(payload);
  return sendSuccess(res, data, 201);
});

export const getCustomerByIdHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await getCustomerById(id);
  return sendSuccess(res, data);
});

export const updateCustomerHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const payload = validatePayloadBody(req.body);
  const data = await updateCustomer(id, payload);
  return sendSuccess(res, data);
});

export const deleteCustomerHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await deleteCustomer(id);
  return sendSuccess(res, data);
});
