import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createPaymentController,
  getPaymentByIdController,
  listPaymentsController,
} from "./payment.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  applicationId: z.string().uuid().optional(),
  status: z.string().optional(),
  currency: z.string().optional(),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    application_id: z.string().uuid(),
    invoice_number: z.string().optional(),
    amount: z.coerce.number().positive(),
    currency: z.string().min(3).max(10),
    payment_status: z.enum(["pending", "paid", "failed"]).optional(),
    payment_method: z.string().optional(),
  })
  .passthrough();

router.use(authMiddleware);

router.get(
  "/",
  permissionMiddleware("payments", "view"),
  requestValidator({ query: querySchema }),
  listPaymentsController
);
router.get(
  "/:id",
  permissionMiddleware("payments", "view"),
  requestValidator({ params: paramsSchema }),
  getPaymentByIdController
);
router.post(
  "/",
  permissionMiddleware("payments", "create"),
  requestValidator({ body: bodySchema }),
  createPaymentController
);

export default router;
