import { createHash, timingSafeEqual } from "node:crypto";
import env from "../config/env.js";

const INVALID_SERVICE_CREDENTIAL_MESSAGE = "Unauthorized";

const digestToken = (value) =>
  createHash("sha256").update(value, "utf8").digest();

export const isValidNexusInternalToken = (providedToken, configuredToken) => {
  const normalizedProvidedToken =
    typeof providedToken === "string" ? providedToken.trim() : "";
  const normalizedConfiguredToken =
    typeof configuredToken === "string" ? configuredToken.trim() : "";

  const matches = timingSafeEqual(
    digestToken(normalizedProvidedToken),
    digestToken(normalizedConfiguredToken),
  );

  return Boolean(
    normalizedProvidedToken && normalizedConfiguredToken && matches,
  );
};

export const authenticateNexusService = (req, res, next) => {
  const providedToken = req.headers["x-nexus-internal-token"];

  if (
    !isValidNexusInternalToken(
      Array.isArray(providedToken) ? null : providedToken,
      env.nexusInternalToken,
    )
  ) {
    return res.status(401).json({
      success: false,
      message: INVALID_SERVICE_CREDENTIAL_MESSAGE,
    });
  }

  req.internalService = Object.freeze({
    authenticated: true,
    name: "nexus",
    type: "service",
  });

  return next();
};

export default authenticateNexusService;