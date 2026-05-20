import env from "../config/env.js";

export const getHealthStatus = async () => {
  return {
    service: "Visa Matrix Backend API",
    status: "ok",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    port: env.port,
    authentication: "disabled",
  };
};
