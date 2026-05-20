import { Router } from "express";
import { evaluateRules } from "../services/ruleEngine.js";
import { getRules } from "../services/ruleService.js";

const router = Router();

const isUUID = (value) => {
  return /^[0-9a-fA-F-]{36}$/.test(value);
};

router.post("/validate", async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const application = req.body;
    const { country_id, visa_type_id } = req.body;

    if (!country_id || !visa_type_id) {
      return res.status(400).json({
        success: false,
        message: "country_id and visa_type_id are required",
      });
    }

    if (!isUUID(country_id) || !isUUID(visa_type_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country_id or visa_type_id format",
      });
    }

    const rules = await getRules(country_id, visa_type_id);
    const validationResult = evaluateRules(application, rules);

    return res.status(200).json({
      success: true,
      risk_score: validationResult.risk_score,
      decision: validationResult.decision,
      approval_probability: validationResult.approval_probability,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      suggestions: validationResult.suggestions,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
