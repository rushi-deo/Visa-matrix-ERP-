import { Router } from "express";
import { z } from "zod";
import {
  createInvoiceController,
  generateInvoice,
} from "../controllers/invoice.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import { requestValidator } from "../middleware/requestValidator.js";

const router = Router();

router.post(
  "/generate-invoice",
  authMiddleware,
  permissionMiddleware("invoicing", "create"),
  generateInvoice
);
router.post(
  "/invoice/create",
  authMiddleware,
  permissionMiddleware("invoicing", "create"),
  requestValidator({
    body: z
      .object({
        quotationId: z.string().min(1).optional(),
        quotation_id: z.string().min(1).optional(),
      })
      .refine(
        (payload) => Boolean(payload.quotationId || payload.quotation_id),
        "quotationId is required."
      ),
  }),
  createInvoiceController
);

export default router;
