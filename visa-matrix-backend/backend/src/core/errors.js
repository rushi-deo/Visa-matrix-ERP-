export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
    Object.freeze(this);
    
  }
}

export class RequestValidationError extends AppError {
  constructor(message = "Validation failed.", details = null) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required.", details = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied.", details = null) {
    super(message, 403, details);
  }
}

/** Alias for enterprise auth/RBAC callers expecting AuthorizationError */
export class AuthorizationError extends ForbiddenError {
  constructor(message = "Access denied.", details = null) {
    super(message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.", details = null) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict.", details = null) {
    super(message, 409, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service failure.", details = null) {
    super(message, 502, details);
  }
}

export const asyncHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export const fromSupabaseError = (
  error,
  fallbackMessage = "Database request failed."
) => {
  if (!error) {
    return new AppError(fallbackMessage, 500);
  }

  if (error.code === "PGRST116") {
    return new NotFoundError("Resource not found.");
  }

  if (error.code === "23505") {
    return new ConflictError("A record with this value already exists.", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error.code === "23503") {
    return new RequestValidationError("A referenced record does not exist.", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  return new AppError(fallbackMessage, 500, {
    code: error.code || null,
    message: error.message,
    details: error.details || null,
    hint: error.hint || null,
  });
};
