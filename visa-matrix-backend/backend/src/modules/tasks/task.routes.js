import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createTaskController,
  deleteTaskController,
  getTaskByIdController,
  listTasksController,
  updateTaskController,
} from "./task.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  applicationId: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    application_id: z.string().uuid().optional(),
    assigned_to: z.string().optional(),
    title: z.string().min(2).max(160).optional(),
    task_title: z.string().min(2).max(160).optional(),
    description: z.string().optional(),
    task_description: z.string().optional(),
    due_date: z.string().optional(),
    priority: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authenticateUser);

router.get(
  "/",
  authorize("admin", "agent", "case_manager"),
  requestValidator({ query: querySchema }),
  listTasksController,
);
router.get(
  "/:id",
  authorize("admin", "agent", "case_manager"),
  requestValidator({ params: paramsSchema }),
  getTaskByIdController,
);
router.post(
  "/",
  authorize("admin", "agent", "case_manager"),
  requestValidator({ body: bodySchema }),
  createTaskController,
);
router.put(
  "/:id",
  authorize("admin", "agent", "case_manager"),
  requestValidator({ params: paramsSchema, body: bodySchema }),
  updateTaskController,
);
router.delete(
  "/:id",
  authorize("admin", "case_manager"),
  requestValidator({ params: paramsSchema }),
  deleteTaskController,
);

export default router;
