import supabase from "../config/supabase.js";
import logger from "../core/logger.js";
import { AppError, NotFoundError, RequestValidationError, fromSupabaseError } from "../core/errors.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
} from "../utils/tenantSecurity.js";

const normalizeTextValue = (value) => String(value ?? "").trim();

const fetchQuotationRecord = async (quotationId) => {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", quotationId)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch quotation.");
  }

  if (!data) {
    throw new NotFoundError("Quotation not found.");
  }

  return data;
};

const tryInsertInvoice = async (payloads) => {
  let lastError = null;

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("invoices")
      .insert(payload)
      .select("*")
      .single();

    if (!error) {
      return data;
    }

    lastError = error;
    logger.warn("Invoice insert attempt failed", {
      message: error.message,
      code: error.code ?? null,
      payloadKeys: Object.keys(payload),
    });
  }

  throw fromSupabaseError(lastError, "Failed to create invoice.");
};

export const createInvoice = async (quotationId, authContext = {}) => {
  if (!normalizeTextValue(quotationId)) {
    throw new RequestValidationError("quotationId is required.");
  }

  const quotation = await fetchQuotationRecord(quotationId);
  assertTenantAccess(quotation, authContext, "quotation");
  const amount = Number(quotation.total_amount ?? 0) || 0;
  const createdAt = new Date().toISOString();

  const invoicePayloads = [
    applyTenantToPayload({
      quotation_id: quotation.id,
      application_id: quotation.application_id ?? null,
      amount,
      subtotal: amount,
      tax_amount: 0,
      total_amount: amount,
      country: quotation.country_name ?? null,
      visa_type: quotation.visa_type ?? null,
      status: "pending",
      created_at: createdAt,
    }, authContext),
    applyTenantToPayload({
      application_id: quotation.application_id ?? null,
      subtotal: amount,
      tax_amount: 0,
      total_amount: amount,
      country: quotation.country_name ?? null,
      visa_type: quotation.visa_type ?? null,
      status: "pending",
      created_at: createdAt,
    }, authContext),
  ];

  try {
    return await tryInsertInvoice(invoicePayloads);
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError("Failed to create invoice.", 500);
  }
};

export default {
  createInvoice,
};
