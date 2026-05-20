import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createMessageController,
  getMessageByIdController,
  listMessagesController,
  updateMessageController,
} from "./communication.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  applicationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  channel: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    application_id: z.string().uuid().optional(),
    customer_id: z.string().uuid().optional(),
    channel: z.enum(["email", "sms", "whatsapp", "in_app"]).optional(),
    subject: z.string().min(2).max(160).optional(),
    content: z.string().min(2).optional(),
    body: z.string().min(2).optional(),
    recipient_email: z.string().email().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authenticateUser);

router.get(
  "/messages",
  authorize("admin", "agent", "case_manager", "accountant"),
  requestValidator({ query: querySchema }),
  listMessagesController,
);
router.get(
  "/messages/:id",
  authorize("admin", "agent", "case_manager", "accountant"),
  requestValidator({ params: paramsSchema }),
  getMessageByIdController,
);
router.post(
  "/messages",
  authorize("admin", "agent", "case_manager"),
  requestValidator({ body: bodySchema }),
  createMessageController,
);
router.put(
  "/messages/:id",
  authorize("admin", "agent", "case_manager"),
  requestValidator({ params: paramsSchema, body: bodySchema }),
  updateMessageController,
);

export default router;
