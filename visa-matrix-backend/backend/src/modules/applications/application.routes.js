import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createApplicationController,
  deleteApplicationController,
  getApplicationByIdController,
  listApplicationsController,
  updateApplicationController,
} from "./application.controller.js";

const router = Router();

const applicationStatusSchema = z.enum([
  "draft",
  "submitted",
  "payment_pending",
  "payment_confirmed",
  "documents_pending",
  "documents_uploaded",
  "document_review",
  "additional_docs_required",
  "ready_for_submission",
  "submitted_to_embassy",
  "embassy_processing",
  "approved",
  "rejected",
  "withdrawn",
  "closed",
]);

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  customerId: z.string().uuid().optional(),
  countryId: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
  status: applicationStatusSchema.optional(),
  applicationStatus: applicationStatusSchema.optional(),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    customer_id: z.string().uuid().optional(),
    country_id: z.string().uuid().optional(),
    visa_type_id: z.string().uuid().optional(),
    assigned_to: z.string().optional(),
    status: applicationStatusSchema.optional(),
    application_status: applicationStatusSchema.optional(),
    notes: z.string().optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authMiddleware);

router.get(
  "/",
  permissionMiddleware("applications", "view"),
  requestValidator({ query: querySchema }),
  listApplicationsController,
);
router.get(
  "/:id",
  permissionMiddleware("applications", "view"),
  requestValidator({ params: paramsSchema }),
  getApplicationByIdController,
);
router.post(
  "/",
  permissionMiddleware("applications", "create"),
  requestValidator({ body: bodySchema }),
  createApplicationController,
);
router.put(
  "/:id",
  permissionMiddleware("applications", "edit"),
  requestValidator({ params: paramsSchema, body: bodySchema }),
  updateApplicationController,
);
router.delete(
  "/:id",
  permissionMiddleware("applications", "delete"),
  requestValidator({ params: paramsSchema }),
  deleteApplicationController,
);

export default router;
