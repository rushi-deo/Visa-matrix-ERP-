import logger from "../core/logger.js";

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.http("HTTP request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
    });
  });

  next();
};
