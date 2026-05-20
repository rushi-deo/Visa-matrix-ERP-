import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createPaymentRecord,
  getPayment,
  getPayments,
} from "./payment.service.js";

export const listPaymentsController = asyncHandler(async (req, res) => {
  const data = await getPayments(req.query);
  return sendSuccess(res, data);
});

export const getPaymentByIdController = asyncHandler(async (req, res) => {
  const data = await getPayment(req.params.id, req.auth);
  return sendSuccess(res, data);
});

export const createPaymentController = asyncHandler(async (req, res) => {
  const data = await createPaymentRecord(req.body, req.auth);
  return sendCreated(res, data, "Payment created successfully.");
});
