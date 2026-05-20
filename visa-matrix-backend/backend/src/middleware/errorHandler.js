import logger from "../core/logger.js";
import { AppError, NotFoundError } from "../core/errors.js";
import { sendErrorResponse } from "../core/response.js";

export const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  const normalizedError =
    error instanceof AppError
      ? error
      : new AppError("Internal server error.", 500, {
          cause: error.message,
        });

  logger.error("Unhandled request error", {
    method: req.method,
    url: req.originalUrl,
    statusCode: normalizedError.statusCode,
    error: normalizedError.message,
    details: normalizedError.details,
    stack: error.stack,
  });

  return sendErrorResponse(res, normalizedError, normalizedError.statusCode);
};
