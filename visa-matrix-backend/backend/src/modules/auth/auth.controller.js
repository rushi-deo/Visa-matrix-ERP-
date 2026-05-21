import { sendCreated, sendSuccess } from "../../core/response.js";
import { asyncHandler } from "../../core/errors.js";
import { getCurrentUser, login, logout, register } from "./auth.service.js";

export const registerUser = asyncHandler(async (req, res) => {
  const data = await register(req.body);
  return sendCreated(res, data, "User registered successfully.");
});

export const loginUser = asyncHandler(async (req, res) => {
  const data = await login(req.body);
  return sendSuccess(res, data, {
    message: "User logged in successfully.",
  });
});

export const logoutUser = asyncHandler(async (_req, res) => {
  const data = await logout();
  return sendSuccess(res, data, {
    message: "User logged out successfully.",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const data = await getCurrentUser(req.auth);

  // Return user with role and permissions for frontend dynamic UI
  return sendSuccess(
    res,
    {
      user: data,
      role: req.user?.role || req.auth?.role,
      permissions: req.user?.permissions || req.auth?.permissions || [],
    },
    {
      message: "Current user retrieved successfully.",
    },
  );
});
