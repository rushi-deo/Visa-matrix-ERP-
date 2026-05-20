import supabase from "../config/supabase.js";
import logger from "../core/logger.js";
import { AppError, NotFoundError, RequestValidationError, fromSupabaseError } from "../core/errors.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
} from "../utils/tenantSecurity.js";

const normalizeTextValue = (value) => String(value ?? "").trim();

const toNumberValue = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const fetchInvoiceRecord = async (invoiceId) => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch invoice.");
  }

  if (!data) {
    throw new NotFoundError("Invoice not found.");
  }

  return data;
};

const tryInsertPayment = async (payloads) => {
  let lastError = null;

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("payments")
      .insert(payload)
      .select("*")
      .single();

    if (!error) {
      return data;
    }

    lastError = error;
    logger.warn("Payment insert attempt failed", {
      message: error.message,
      code: error.code ?? null,
      payloadKeys: Object.keys(payload),
    });
  }

  throw fromSupabaseError(lastError, "Failed to create payment.");
};

const updateInvoiceAsPaid = async (invoiceId) => {
  const paidAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: paidAt,
    })
    .eq("id", invoiceId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to update invoice after payment.");
  }

  if (!data) {
    throw new NotFoundError("Invoice not found for payment update.");
  }

  return data;
};

export const createPayment = async (
  { invoiceId, amount, payment_method, paymentMethod },
  authContext = {}
) => {
  if (!normalizeTextValue(invoiceId)) {
    throw new RequestValidationError("invoiceId is required.");
  }

  const method = normalizeTextValue(payment_method ?? paymentMethod);

  if (!method) {
    throw new RequestValidationError("payment_method is required.");
  }

  const invoice = await fetchInvoiceRecord(invoiceId);
  assertTenantAccess(invoice, authContext, "invoice");
  const resolvedAmount = toNumberValue(
    amount,
    toNumberValue(invoice.amount, toNumberValue(invoice.total_amount, 0))
  );
  const createdAt = new Date().toISOString();

  const paymentPayloads = [
    applyTenantToPayload({
      invoice_id: invoice.id,
      application_id: invoice.application_id ?? null,
      invoice_number: invoice.invoice_no ?? invoice.invoice_number ?? String(invoice.id),
      amount: resolvedAmount,
      payment_method: method,
      payment_status: "paid",
      status: "success",
      created_at: createdAt,
      paid_at: createdAt,
    }, authContext),
    applyTenantToPayload({
      application_id: invoice.application_id ?? null,
      invoice_number: invoice.invoice_no ?? invoice.invoice_number ?? String(invoice.id),
      amount: resolvedAmount,
      payment_method: method,
      payment_status: "paid",
      created_at: createdAt,
      paid_at: createdAt,
    }, authContext),
  ];

  try {
    const payment = await tryInsertPayment(paymentPayloads);
    const updatedInvoice = await updateInvoiceAsPaid(invoice.id);

    return {
      payment,
      invoice: updatedInvoice,
    };
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to create payment.", 500);
  }
};

export default {
  createPayment,
};
