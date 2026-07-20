import express from "express";
import {
  createCustomerHandler,
  getCustomerHandler,
  getCustomersHandler,
} from "../controllers/customersController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/customers", authMiddleware, asyncHandler(getCustomersHandler));
router.post("/customers", authMiddleware, asyncHandler(createCustomerHandler));
router.get("/customers/:id", authMiddleware, asyncHandler(getCustomerHandler));

export default router;
