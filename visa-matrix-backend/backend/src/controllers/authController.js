import {
  loginAdmin as loginAdminService,
  registerAdmin as registerAdminService,
} from "../services/authService.js";
import {
  hasValidPasswordLength,
  isValidEmail,
  requiredFields,
} from "../utils/validation.js";

const ALLOWED_ADMIN_EMAIL = "ruushisdeo@visamatrix.in";
const ALLOWED_ROLES = ["admin", "manager", "agent", "customer"];

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const registerAdmin = async (req, res) => {
  try {
    const { full_name, email, role, password } = req.body;
    const validation = requiredFields(req.body, [
      "full_name",
      "email",
      "role",
      "password",
    ]);

    if (!validation.valid) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "A valid email is required",
      });
    }

    if (!hasValidPasswordLength(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (!ALLOWED_ROLES.includes(normalizeRole(role))) {
      return res.status(400).json({
        message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`,
      });
    }

    const user = await registerAdminService({
      full_name,
      email,
      role: normalizeRole(role),
      password,
    });

    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : "Registration failed",
      error: error.message,
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validation = requiredFields(req.body, ["email", "password"]);

    if (!validation.valid) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "A valid email is required",
      });
    }

    if (normalizeEmail(email) !== ALLOWED_ADMIN_EMAIL) {
      return res.status(403).json({
        message: "Access denied. Only authorized admin can login.",
      });
    }

    const result = await loginAdminService({
      email,
      password,
    });

    return res.json(result);
  } catch (error) {
    console.error("Login error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode && error.statusCode < 500 ? error.message : "Login failed",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  const validation = requiredFields(req.body, ["email"]);

  if (!validation.valid || !isValidEmail(req.body.email)) {
    return res.status(400).json({
      message: "A valid email is required",
    });
  }

  return res.json({
    message:
      "Password reset is not configured in this build. Contact an administrator.",
  });
};
