import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createVisaRuleController,
  deleteVisaRuleController,
  getVisaRuleByIdController,
  listVisaRulesController,
  updateVisaRuleController,
} from "./visaRule.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  countryId: z.string().uuid().optional(),
  visaTypeId: z.string().uuid().optional(),
});

const bodySchema = z
  .object({
    title: z.string().min(2).max(160).optional(),
    description: z.string().min(2).optional(),
    country_id: z.string().uuid().optional(),
    visa_type_id: z.string().uuid().optional(),
    is_required: z.boolean().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authenticateUser);

router.get(
  "/",
  authorize("admin", "agent", "case_manager", "accountant"),
  requestValidator({ query: querySchema }),
  listVisaRulesController,
);
router.get(
  "/:id",
  authorize("admin", "agent", "case_manager", "accountant"),
  requestValidator({ params: paramsSchema }),
  getVisaRuleByIdController,
);
router.post(
  "/",
  authorize("admin", "case_manager"),
  requestValidator({ body: bodySchema }),
  createVisaRuleController,
);
router.put(
  "/:id",
  authorize("admin", "case_manager"),
  requestValidator({ params: paramsSchema, body: bodySchema }),
  updateVisaRuleController,
);
router.delete(
  "/:id",
  authorize("admin"),
  requestValidator({ params: paramsSchema }),
  deleteVisaRuleController,
);

export default router;
