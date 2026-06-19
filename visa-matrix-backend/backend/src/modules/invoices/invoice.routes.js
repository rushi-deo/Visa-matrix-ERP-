import { Router } from "express";
import { createInvoice, listInvoices } from "./invoice.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("invoicing", "view"),
  listInvoices
);

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("invoicing", "create"),
  createInvoice
);

export default router;