import express from "express";
import {
  forgotPassword,
  loginAdmin,
  registerAdmin,
} from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/register", asyncHandler(registerAdmin));
router.post("/login", asyncHandler(loginAdmin));
router.post("/forgot-password", asyncHandler(forgotPassword));

export default router;
