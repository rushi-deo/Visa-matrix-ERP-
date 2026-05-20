import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  listPayments,
  updatePayment,
} from "../services/paymentService.js";
import {
  validatePayloadBody,
  validateResourceId,
} from "../validators/requestValidators.js";

export const getPayments = asyncHandler(async (req, res) => {
  const data = await listPayments(req.query);
  return sendSuccess(res, data);
});

export const createPaymentHandler = asyncHandler(async (req, res) => {
  const payload = validatePayloadBody(req.body);
  const data = await createPayment(payload, req.auth);
  return sendSuccess(res, data, 201);
});

export const getPaymentByIdHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await getPaymentById(id, req.auth);
  return sendSuccess(res, data);
});

export const updatePaymentHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const payload = validatePayloadBody(req.body);
  const data = await updatePayment(id, payload, req.auth);
  return sendSuccess(res, data);
});

export const deletePaymentHandler = asyncHandler(async (req, res) => {
  const id = validateResourceId(req.params.id);
  const data = await deletePayment(id, req.auth);
  return sendSuccess(res, data);
});
