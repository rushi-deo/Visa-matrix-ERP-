import {
  ensureEnum,
  ensureRequiredFields,
  ensureUuid,
  finalizePayload,
  normalizeBoolean,
  normalizeDate,
  normalizeEmail,
  normalizeNumber,
  normalizeOptionalString,
  normalizeRequiredString,
  pickFields,
} from "./commonValidators.js";
import { ApiError } from "../utils/apiError.js";

export const applicationStatuses = [
  "draft",
  "submitted",
  "under_review",
  "embassy_processing",
  "approved",
  "rejected",
];

export const paymentStatuses = ["pending", "paid", "failed"];

export const workflowStages = [
  "application_received",
  "documents_pending",
  "documents_verified",
  "embassy_submitted",
  "decision_pending",
  "completed",
];

const validateOptionalUuid = (fieldName, value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  return ensureUuid(fieldName, value);
};

export const validateIdParam = (value, fieldName = "id") => {
  return ensureUuid(fieldName, value);
};

export const validateCountryPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "country_name",
    "country_code",
    "visa_required",
    "processing_time",
    "embassy_contact",
    "notes",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["country_name", "country_code"]);
  }

  return finalizePayload({
    country_name:
      values.country_name === undefined
        ? undefined
        : normalizeRequiredString("country_name", values.country_name),
    country_code:
      values.country_code === undefined
        ? undefined
        : normalizeRequiredString("country_code", values.country_code).toUpperCase(),
    visa_required: normalizeBoolean("visa_required", values.visa_required, partial ? undefined : true),
    processing_time: normalizeOptionalString("processing_time", values.processing_time),
    embassy_contact: normalizeOptionalString("embassy_contact", values.embassy_contact),
    notes: normalizeOptionalString("notes", values.notes),
  });
};

export const validateVisaTypePayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "country_id",
    "visa_name",
    "visa_category",
    "processing_time",
    "visa_fee",
    "requirements",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["country_id", "visa_name", "visa_category"]);
  }

  return finalizePayload({
    country_id: validateOptionalUuid("country_id", values.country_id),
    visa_name:
      values.visa_name === undefined
        ? undefined
        : normalizeRequiredString("visa_name", values.visa_name),
    visa_category:
      values.visa_category === undefined
        ? undefined
        : normalizeRequiredString("visa_category", values.visa_category),
    processing_time: normalizeOptionalString("processing_time", values.processing_time),
    visa_fee: normalizeNumber("visa_fee", values.visa_fee, { min: 0 }),
    requirements: normalizeOptionalString("requirements", values.requirements),
  });
};

export const validateCustomerPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "full_name",
    "email",
    "phone",
    "passport_number",
    "nationality",
    "date_of_birth",
    "notes",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["full_name"]);
  }

  return finalizePayload({
    full_name:
      values.full_name === undefined
        ? undefined
        : normalizeRequiredString("full_name", values.full_name),
    email: normalizeEmail("email", values.email),
    phone: normalizeOptionalString("phone", values.phone),
    passport_number: normalizeOptionalString(
      "passport_number",
      values.passport_number
    ),
    nationality: normalizeOptionalString("nationality", values.nationality),
    date_of_birth: normalizeDate("date_of_birth", values.date_of_birth),
    notes: normalizeOptionalString("notes", values.notes),
  });
};

export const validateApplicationPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "customer_id",
    "country_id",
    "visa_type_id",
    "application_status",
    "submission_date",
    "embassy_date",
    "decision_date",
    "notes",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["customer_id", "country_id", "visa_type_id"]);
  }

  return finalizePayload({
    customer_id: validateOptionalUuid("customer_id", values.customer_id),
    country_id: validateOptionalUuid("country_id", values.country_id),
    visa_type_id: validateOptionalUuid("visa_type_id", values.visa_type_id),
    application_status:
      values.application_status === undefined
        ? partial
          ? undefined
          : "draft"
        : ensureEnum(
            "application_status",
            values.application_status,
            applicationStatuses
          ),
    submission_date: normalizeDate("submission_date", values.submission_date),
    embassy_date: normalizeDate("embassy_date", values.embassy_date),
    decision_date: normalizeDate("decision_date", values.decision_date),
    notes: normalizeOptionalString("notes", values.notes),
  });
};

export const validateDocumentPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "application_id",
    "document_type",
    "file_url",
    "file_base64",
    "file_name",
    "content_type",
    "verification_status",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["application_id", "document_type"]);
  }

  if (!partial && !values.file_url && !values.file_base64) {
    throw new ApiError(
      400,
      "Either file_url or file_base64 must be provided for a document upload."
    );
  }

  return finalizePayload({
    application_id:
      values.application_id === undefined
        ? undefined
        : ensureUuid("application_id", values.application_id),
    document_type:
      values.document_type === undefined
        ? undefined
        : normalizeRequiredString("document_type", values.document_type),
    file_url: normalizeOptionalString("file_url", values.file_url),
    file_base64: values.file_base64,
    file_name: normalizeOptionalString("file_name", values.file_name),
    content_type: normalizeOptionalString("content_type", values.content_type),
    verification_status:
      values.verification_status === undefined
        ? partial
          ? undefined
          : "pending"
        : normalizeRequiredString(
            "verification_status",
            values.verification_status
          ),
  });
};

export const validatePaymentPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "application_id",
    "invoice_number",
    "amount",
    "currency",
    "payment_status",
    "payment_method",
    "paid_at",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["application_id", "amount", "currency"]);
  }

  return finalizePayload({
    application_id: validateOptionalUuid("application_id", values.application_id),
    invoice_number: normalizeOptionalString("invoice_number", values.invoice_number),
    amount: normalizeNumber("amount", values.amount, { min: 0 }),
    currency:
      values.currency === undefined
        ? undefined
        : normalizeRequiredString("currency", values.currency).toUpperCase(),
    payment_status:
      values.payment_status === undefined
        ? partial
          ? undefined
          : "pending"
        : ensureEnum("payment_status", values.payment_status, paymentStatuses),
    payment_method: normalizeOptionalString("payment_method", values.payment_method),
    paid_at: normalizeDate("paid_at", values.paid_at),
  });
};

export const validateWorkflowPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, ["application_id", "stage", "notes"]);

  if (!partial) {
    ensureRequiredFields(values, ["application_id", "stage"]);
  }

  return finalizePayload({
    application_id: validateOptionalUuid("application_id", values.application_id),
    stage:
      values.stage === undefined
        ? partial
          ? undefined
          : workflowStages[0]
        : ensureEnum("stage", values.stage, workflowStages),
    notes: normalizeOptionalString("notes", values.notes),
  });
};

export const validateTaskPayload = (payload, { partial = false } = {}) => {
  const values = pickFields(payload, [
    "application_id",
    "task_title",
    "task_description",
    "assigned_to",
    "due_date",
    "status",
  ]);

  if (!partial) {
    ensureRequiredFields(values, ["application_id", "task_title"]);
  }

  return finalizePayload({
    application_id: validateOptionalUuid("application_id", values.application_id),
    task_title:
      values.task_title === undefined
        ? undefined
        : normalizeRequiredString("task_title", values.task_title),
    task_description: normalizeOptionalString(
      "task_description",
      values.task_description
    ),
    assigned_to: normalizeOptionalString("assigned_to", values.assigned_to),
    due_date: normalizeDate("due_date", values.due_date),
    status:
      values.status === undefined
        ? partial
          ? undefined
          : "pending"
        : normalizeRequiredString("status", values.status),
  });
};

export const validateNotificationPayload = (payload) => {
  const values = pickFields(payload, [
    "title",
    "message",
    "type",
    "related_application",
  ]);

  ensureRequiredFields(values, ["title", "message"]);

  return finalizePayload({
    title: normalizeRequiredString("title", values.title),
    message: normalizeRequiredString("message", values.message),
    type: normalizeOptionalString("type", values.type),
    related_application: validateOptionalUuid(
      "related_application",
      values.related_application
    ),
  });
};
