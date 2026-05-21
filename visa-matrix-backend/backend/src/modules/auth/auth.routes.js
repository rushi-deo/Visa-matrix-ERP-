import { Router } from "express";
import { authenticateToken } from "../../middleware/rbac.middleware.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
} from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  requestValidator({ body: registerSchema }),
  registerUser,
);
router.post(
  "/login",
  authRateLimiter,
  requestValidator({ body: loginSchema }),
  loginUser,
);
router.post("/logout", authenticateToken, logoutUser);
router.get("/me", authenticateToken, getMe);

export default router;
