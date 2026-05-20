import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createVisaRuleRecord,
  deleteVisaRuleRecord,
  getVisaRule,
  getVisaRules,
  updateVisaRuleRecord,
} from "./visaRule.service.js";

export const listVisaRulesController = asyncHandler(async (req, res) => {
  const data = await getVisaRules(req.query);
  return sendSuccess(res, data);
});

export const getVisaRuleByIdController = asyncHandler(async (req, res) => {
  const data = await getVisaRule(req.params.id);
  return sendSuccess(res, data);
});

export const createVisaRuleController = asyncHandler(async (req, res) => {
  const data = await createVisaRuleRecord(req.body);
  return sendCreated(res, data, "Visa rule created successfully.");
});

export const updateVisaRuleController = asyncHandler(async (req, res) => {
  const data = await updateVisaRuleRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Visa rule updated successfully.",
  });
});

export const deleteVisaRuleController = asyncHandler(async (req, res) => {
  const data = await deleteVisaRuleRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Visa rule deleted successfully.",
  });
});
