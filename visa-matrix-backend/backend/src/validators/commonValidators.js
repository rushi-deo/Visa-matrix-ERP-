import { ApiError } from "../utils/apiError.js";
import { removeUndefined } from "../utils/validation.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trimString = (value) => {
  return typeof value === "string" ? value.trim() : value;
};

export const pickFields = (payload, allowedFields) => {
  return allowedFields.reduce((result, field) => {
    if (payload[field] !== undefined) {
      result[field] = payload[field];
    }

    return result;
  }, {});
};

export const ensureRequiredFields = (payload, fields) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length) {
    throw new ApiError(
      400,
      `Missing required fields: ${missing.join(", ")}.`
    );
  }
};

export const normalizeRequiredString = (fieldName, value) => {
  const normalized = trimString(value);

  if (!normalized) {
    throw new ApiError(400, `${fieldName} is required.`);
  }

  return normalized;
};

export const normalizeOptionalString = (fieldName, value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || trimString(value) === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} must be a string.`);
  }

  return value.trim();
};

export const normalizeBoolean = (fieldName, value, defaultValue = undefined) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1" || value === 1) {
    return true;
  }

  if (value === "false" || value === "0" || value === 0) {
    return false;
  }

  throw new ApiError(400, `${fieldName} must be a boolean.`);
};

export const normalizeNumber = (
  fieldName,
  value,
  { integer = false, min = null } = {}
) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    throw new ApiError(400, `${fieldName} must be a valid number.`);
  }

  if (integer && !Number.isInteger(normalized)) {
    throw new ApiError(400, `${fieldName} must be an integer.`);
  }

  if (min !== null && normalized < min) {
    throw new ApiError(400, `${fieldName} must be at least ${min}.`);
  }

  return normalized;
};

export const normalizeDate = (fieldName, value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const normalized = new Date(value);

  if (Number.isNaN(normalized.getTime())) {
    throw new ApiError(400, `${fieldName} must be a valid date.`);
  }

  return normalized.toISOString().slice(0, 10);
};

export const normalizeEmail = (fieldName, value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new ApiError(400, `${fieldName} must be a valid email address.`);
  }

  return normalized;
};

export const ensureEnum = (fieldName, value, allowedValues) => {
  if (value === undefined) {
    return undefined;
  }

  if (!allowedValues.includes(value)) {
    throw new ApiError(
      400,
      `${fieldName} must be one of: ${allowedValues.join(", ")}.`
    );
  }

  return value;
};

export const ensureUuid = (fieldName, value) => {
  if (!UUID_PATTERN.test(String(value || ""))) {
    throw new ApiError(400, `${fieldName} must be a valid UUID.`);
  }

  return value;
};

export const finalizePayload = (payload) => {
  return removeUndefined(payload);
};
