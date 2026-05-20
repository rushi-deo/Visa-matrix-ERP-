import { RequestValidationError } from "../../core/errors.js";

export const APPLICATION_STATUSES = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_CONFIRMED: "payment_confirmed",
  DOCUMENTS_PENDING: "documents_pending",
  DOCUMENTS_UPLOADED: "documents_uploaded",
  DOCUMENT_REVIEW: "document_review",
  ADDITIONAL_DOCS_REQUIRED: "additional_docs_required",
  READY_FOR_SUBMISSION: "ready_for_submission",
  SUBMITTED_TO_EMBASSY: "submitted_to_embassy",
  EMBASSY_PROCESSING: "embassy_processing",
  APPROVED: "approved",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  CLOSED: "closed",
});

export const APPLICATION_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUSES.DRAFT]: [
    APPLICATION_STATUSES.SUBMITTED,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.SUBMITTED]: [
    APPLICATION_STATUSES.PAYMENT_PENDING,
    APPLICATION_STATUSES.DOCUMENTS_PENDING,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.PAYMENT_PENDING]: [
    APPLICATION_STATUSES.PAYMENT_CONFIRMED,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.PAYMENT_CONFIRMED]: [
    APPLICATION_STATUSES.DOCUMENTS_PENDING,
    APPLICATION_STATUSES.DOCUMENT_REVIEW,
  ],
  [APPLICATION_STATUSES.DOCUMENTS_PENDING]: [
    APPLICATION_STATUSES.DOCUMENTS_UPLOADED,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.DOCUMENTS_UPLOADED]: [
    APPLICATION_STATUSES.DOCUMENT_REVIEW,
  ],
  [APPLICATION_STATUSES.DOCUMENT_REVIEW]: [
    APPLICATION_STATUSES.ADDITIONAL_DOCS_REQUIRED,
    APPLICATION_STATUSES.READY_FOR_SUBMISSION,
    APPLICATION_STATUSES.REJECTED,
  ],
  [APPLICATION_STATUSES.ADDITIONAL_DOCS_REQUIRED]: [
    APPLICATION_STATUSES.DOCUMENTS_UPLOADED,
    APPLICATION_STATUSES.WITHDRAWN,
  ],
  [APPLICATION_STATUSES.READY_FOR_SUBMISSION]: [
    APPLICATION_STATUSES.SUBMITTED_TO_EMBASSY,
  ],
  [APPLICATION_STATUSES.SUBMITTED_TO_EMBASSY]: [
    APPLICATION_STATUSES.EMBASSY_PROCESSING,
  ],
  [APPLICATION_STATUSES.EMBASSY_PROCESSING]: [
    APPLICATION_STATUSES.APPROVED,
    APPLICATION_STATUSES.REJECTED,
  ],
  [APPLICATION_STATUSES.APPROVED]: [APPLICATION_STATUSES.CLOSED],
  [APPLICATION_STATUSES.REJECTED]: [APPLICATION_STATUSES.CLOSED],
  [APPLICATION_STATUSES.WITHDRAWN]: [APPLICATION_STATUSES.CLOSED],
  [APPLICATION_STATUSES.CLOSED]: [],
});

export const normalizeApplicationStatus = (status) => {
  const normalized = String(status || APPLICATION_STATUSES.DRAFT).trim().toLowerCase();

  if (!Object.values(APPLICATION_STATUSES).includes(normalized)) {
    throw new RequestValidationError(`Invalid application status: ${status}`);
  }

  return normalized;
};

export const assertApplicationTransition = (fromStatus, toStatus) => {
  const from = normalizeApplicationStatus(fromStatus);
  const to = normalizeApplicationStatus(toStatus);

  if (from === to) {
    return { from, to };
  }

  const allowedTargets = APPLICATION_TRANSITIONS[from] || [];

  if (!allowedTargets.includes(to)) {
    throw new RequestValidationError(
      `Invalid application status transition from ${from} to ${to}.`
    );
  }

  return { from, to };
};
