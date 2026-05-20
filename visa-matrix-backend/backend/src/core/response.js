export const sendSuccess = (res, data, options = {}) => {
  const { statusCode = 200, message = null, meta = null } = options;
  const payload = {
    success: true,
    data,
  };

  if (message) {
    payload.message = message;
  }

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, data, message = "Created successfully.") => {
  return sendSuccess(res, data, {
    statusCode: 201,
    message,
  });
};

export const sendNoContent = (res) => {
  return res.status(204).send();
};

export const sendErrorResponse = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message: error.message,
    error: error.details || null,
  });
};
