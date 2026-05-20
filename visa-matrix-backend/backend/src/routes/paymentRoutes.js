import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import {
  createPaymentHandler,
  deletePaymentHandler,
  getPaymentByIdHandler,
  getPayments,
  updatePaymentHandler,
} from "../controllers/paymentController.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("payments", "view"),
  getPayments
);
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("payments", "view"),
  getPaymentByIdHandler
);
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("payments", "create"),
  createPaymentHandler
);
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("payments", "edit"),
  updatePaymentHandler
);
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("payments", "edit"),
  deletePaymentHandler
);

export default router;
