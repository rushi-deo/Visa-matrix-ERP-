import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  getUserByIdController,
  listUsersController,
  updateUserController,
} from "./user.controller.js";

const router = Router();

const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  role: z.string().optional(),
  search: z.string().optional(),
});

const updateUserSchema = z
  .object({
    full_name: z.string().min(2).max(120).optional(),
    phone: z.string().min(6).max(30).optional(),
    avatar_url: z.string().url().optional(),
    timezone: z.string().min(2).max(50).optional(),
    role: z
      .enum(["admin", "agent", "case_manager", "accountant"])
      .optional(),
    status: z.string().min(2).max(50).optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authMiddleware);

router.get(
  "/",
  permissionMiddleware("users", "manage"),
  requestValidator({ query: userListQuerySchema }),
  listUsersController
);
router.get(
  "/:id",
  permissionMiddleware("users", "manage"),
  requestValidator({ params: userIdParamsSchema }),
  getUserByIdController
);
router.put(
  "/:id",
  permissionMiddleware("users", "manage"),
  requestValidator({
    params: userIdParamsSchema,
    body: updateUserSchema,
  }),
  updateUserController
);

export default router;
