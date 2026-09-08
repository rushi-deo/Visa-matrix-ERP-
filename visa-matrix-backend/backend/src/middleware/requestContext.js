import { randomUUID } from "node:crypto";

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";
const MAX_ID_LENGTH = 128;
const VALID_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

const readRequestId = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length <= MAX_ID_LENGTH &&
    VALID_ID_PATTERN.test(normalizedValue)
    ? normalizedValue
    : null;
};

export const requestContext = (req, res, next) => {
  const requestId =
    readRequestId(req.headers[REQUEST_ID_HEADER]) || randomUUID();
  const correlationId =
    readRequestId(req.headers[CORRELATION_ID_HEADER]) || requestId;

  req.requestId = requestId;
  req.correlationId = correlationId;
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Correlation-ID", correlationId);

  return next();
};

export default requestContext;