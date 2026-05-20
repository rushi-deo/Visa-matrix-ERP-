import winston from "winston";
import env from "../config/env.js";

const { combine, timestamp, errors, colorize, printf, json } = winston.format;

const developmentFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp: logTimestamp, stack, ...meta }) => {
    const metadata = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : "";

    return `${logTimestamp} ${level}: ${stack || message}${metadata}`;
  })
);

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.logLevel,
  format: env.isProduction ? productionFormat : developmentFormat,
  defaultMeta: {
    service: "visa-matrix-backend",
    environment: env.nodeEnv,
  },
  transports: [new winston.transports.Console()],
});

export default logger;
