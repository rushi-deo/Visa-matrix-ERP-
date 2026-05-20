import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import { requestValidator } from "../middleware/requestValidator.js";
import { createPaymentController } from "../controllers/payment.controller.js";

const router = Router();

const bodySchema = z
  .object({
    invoiceId: z.string().min(1).optional(),
    invoice_id: z.string().min(1).optional(),
    amount: z.coerce.number().positive().optional(),
    payment_method: z.string().min(1).optional(),
    paymentMethod: z.string().min(1).optional(),
  })
  .refine((payload) => Boolean(payload.invoiceId || payload.invoice_id), "invoiceId is required.")
  .refine(
    (payload) => Boolean(payload.payment_method || payload.paymentMethod),
    "payment_method is required."
  );

router.use(authMiddleware);

router.post(
  "/payment/create",
  permissionMiddleware("payments", "create"),
  requestValidator({ body: bodySchema }),
  createPaymentController
);

export default router;
