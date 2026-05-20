import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createNotificationController,
  deleteNotificationController,
  getNotificationByIdController,
  listNotificationsController,
  markNotificationReadController,
} from "./notification.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  userId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  channel: z.string().optional(),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    user_id: z.string().uuid().nullable().optional(),
    application_id: z.string().uuid().nullable().optional(),
    type: z.string().min(2).max(60),
    title: z.string().min(2).max(160),
    message: z.string().min(2),
    channel: z.enum(["email", "in_app"]).optional(),
  })
  .passthrough();

router.use(authenticateUser);

router.get(
  "/",
  requestValidator({ query: querySchema }),
  listNotificationsController,
);
router.get(
  "/:id",
  requestValidator({ params: paramsSchema }),
  getNotificationByIdController,
);
router.post(
  "/",
  requestValidator({ body: bodySchema }),
  createNotificationController,
);
router.put(
  "/:id/read",
  requestValidator({ params: paramsSchema }),
  markNotificationReadController,
);
router.delete(
  "/:id",
  requestValidator({ params: paramsSchema }),
  deleteNotificationController,
);

export default router;
