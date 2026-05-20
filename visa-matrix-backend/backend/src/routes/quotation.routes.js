import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { requestValidator } from "../middleware/requestValidator.js";
import {
  createQuotationController,
  getQuotationTemplateController,
  sendQuotationController,
} from "../controllers/quotation.controller.js";

const router = Router();

const bodySchema = z
  .object({
    applicationId: z.string().min(1).optional(),
    application_id: z.string().min(1).optional(),
  })
  .refine(
    (payload) => Boolean(payload.applicationId || payload.application_id),
    "applicationId is required.",
  );

const sendQuotationBodySchema = z
  .object({
    applicationId: z.string().min(1).optional(),
    application_id: z.string().min(1).optional(),
    email: z.string().email(),
  })
  .refine(
    (payload) => Boolean(payload.applicationId || payload.application_id),
    "applicationId is required.",
  );

router.use(authenticateUser);

router.get(
  "/quotation-template",
  authorize("admin", "agent", "case_manager", "accountant"),
  getQuotationTemplateController,
);

router.post(
  "/quotation/create",
  authorize("admin", "agent", "case_manager", "accountant"),
  requestValidator({ body: bodySchema }),
  createQuotationController,
);

router.post(
  "/send-quotation",
  authorize("admin", "agent", "case_manager", "accountant"),
  requestValidator({ body: sendQuotationBodySchema }),
  sendQuotationController,
);

export default router;
