import { Router } from "express";
import {
  listQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  generateInvoice,
} from "./quotation.controller.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("quotations", "view"),
  listQuotations
);

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("quotations", "view"),
  getQuotationById
);
router.post(
  "/:id/generate-invoice",
  authMiddleware,
  permissionMiddleware("quotations", "create"),
  generateInvoice
);
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("quotations", "create"),
  createQuotation
);

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("quotations", "edit"),
  updateQuotation
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("quotations", "delete"),
  deleteQuotation
);

export default router;