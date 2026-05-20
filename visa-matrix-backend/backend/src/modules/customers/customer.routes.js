import { Router } from "express";
import { z } from "zod";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  listCustomersController,
  updateCustomerController,
} from "./customer.controller.js";

const router = Router();

const customerIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const customerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});

const customerBodySchema = z
  .object({
    full_name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(30).optional(),
    passport_number: z.string().min(3).max(50).optional(),
    nationality: z.string().min(2).max(100).optional(),
  })
  .passthrough()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

router.use(authenticateUser);

router.get(
  "/",
  authorize("super_admin", "admin", "agent", "case_manager"),
  requestValidator({ query: customerQuerySchema }),
  listCustomersController,
);
router.get(
  "/:id",
  authorize("super_admin", "admin", "agent", "case_manager"),
  requestValidator({ params: customerIdParamsSchema }),
  getCustomerByIdController,
);
router.post(
  "/",
  authorize("super_admin", "admin", "agent", "case_manager"),
  requestValidator({ body: customerBodySchema }),
  createCustomerController,
);
router.put(
  "/:id",
  authorize("super_admin", "admin", "agent", "case_manager"),
  requestValidator({
    params: customerIdParamsSchema,
    body: customerBodySchema,
  }),
  updateCustomerController,
);
router.delete(
  "/:id",
  authorize("super_admin", "admin", "case_manager"),
  requestValidator({ params: customerIdParamsSchema }),
  deleteCustomerController,
);

export default router;
