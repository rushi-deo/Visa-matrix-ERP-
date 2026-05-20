import { ApiError } from "../utils/apiError.js";

export const validateResourceId = (value, fieldName = "id") => {
  const normalized = String(value || "").trim();

  if (!normalized) {
    throw new ApiError(400, `${fieldName} is required.`);
  }

  return normalized;
};

export const validatePayloadBody = (payload, fieldName = "body") => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    Object.keys(payload).length === 0
  ) {
    throw new ApiError(400, `${fieldName} must be a non-empty object.`);
  }

  return payload;
};
