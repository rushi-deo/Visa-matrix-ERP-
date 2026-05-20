import { Router } from "express";
import { createInvoice } from "./invoice.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";

const router = Router();

const getInvoices = (_req, res) => {
  return res.status(200).json({
    success: true,
    data: [],
  });
};

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("invoicing", "view"),
  getInvoices
);

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("invoicing", "create"),
  createInvoice
);

export default router;
