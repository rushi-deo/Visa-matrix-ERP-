import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createWorkflowController,
  deleteWorkflowController,
  executeWorkflowController,
  getWorkflowByIdController,
  listWorkflowsController,
  updateWorkflowController,
} from "./workflow.controller.js";

const router = Router();

const workflowIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const executeParamsSchema = z.object({
  applicationId: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  triggerKey: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      if (typeof value === "boolean") {
        return value;
      }

      return value === "true";
    }),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    name: z.string().min(2).max(160).optional(),
    trigger_key: z.string().min(2).max(120).optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

const executeBodySchema = z.object({
  triggerKey: z.string().optional(),
});

router.use(authenticateUser);

router.get(
  "/",
  authorize("admin", "case_manager"),
  requestValidator({ query: querySchema }),
  listWorkflowsController,
);
router.get(
  "/:id",
  authorize("admin", "case_manager"),
  requestValidator({ params: workflowIdParamsSchema }),
  getWorkflowByIdController,
);
router.post(
  "/",
  authorize("admin", "case_manager"),
  requestValidator({ body: bodySchema }),
  createWorkflowController,
);
router.put(
  "/:id",
  authorize("admin", "case_manager"),
  requestValidator({ params: workflowIdParamsSchema, body: bodySchema }),
  updateWorkflowController,
);
router.delete(
  "/:id",
  authorize("admin"),
  requestValidator({ params: workflowIdParamsSchema }),
  deleteWorkflowController,
);
router.post(
  "/execute/:applicationId",
  authorize("admin", "case_manager"),
  requestValidator({
    params: executeParamsSchema,
    body: executeBodySchema,
  }),
  executeWorkflowController,
);

export default router;
