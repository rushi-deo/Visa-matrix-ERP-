import { asyncHandler, RequestValidationError } from "../core/errors.js";
import { sendCreated } from "../core/response.js";
import { createPayment } from "../services/payment.service.js";

const parsePaymentBody = (body = {}) => {
  const invoiceId = String(body.invoiceId ?? body.invoice_id ?? "").trim();
  const paymentMethod = String(body.payment_method ?? body.paymentMethod ?? "").trim();
  const amount = body.amount;

  if (!invoiceId) {
    throw new RequestValidationError("invoiceId is required.");
  }

  if (!paymentMethod) {
    throw new RequestValidationError("payment_method is required.");
  }

  return {
    invoiceId,
    amount,
    payment_method: paymentMethod,
  };
};

export const createPaymentController = asyncHandler(async (req, res) => {
  const result = await createPayment(parsePaymentBody(req.body), req.auth);
  return sendCreated(res, result, "Payment created successfully.");
});
