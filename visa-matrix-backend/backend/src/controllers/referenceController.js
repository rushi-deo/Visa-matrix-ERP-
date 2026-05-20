import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { searchReferences } from "../services/referenceService.js";

export const searchReferenceHandler = asyncHandler(async (req, res) => {
  const data = await searchReferences(req.query.q);
  return sendSuccess(res, data);
});
