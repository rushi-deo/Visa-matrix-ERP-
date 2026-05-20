import { asyncHandler } from "../utils/asyncHandler.js";
import { getHealthStatus } from "../services/healthService.js";
import { sendSuccess } from "../utils/response.js";

export const getHealth = asyncHandler(async (_req, res) => {
  const data = await getHealthStatus();
  return sendSuccess(res, data);
});
