import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { testDatabaseConnection } from "../services/devService.js";

export const testDatabaseHandler = asyncHandler(async (_req, res) => {
  const data = await testDatabaseConnection();
  return sendSuccess(res, data);
});
