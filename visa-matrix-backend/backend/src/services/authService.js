import { supabase } from "../config/supabaseClient.js";
import {
  hashAdminPassword,
  compareAdminPassword,
  getSafeAdminUser,
  signAdminToken,
  verifyAdminToken,
} from "../utils/adminSecurity.js";

const createRequestError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ALLOWED_ADMIN_EMAIL = "ruushisdeo@visamatrix.in";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const fetchUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    throw createRequestError(`Failed to query users: ${error.message}`);
  }

  return data;
};

const compareAndUpgradePassword = async (user, password) => {
  const storedPassword = String(user?.password || "");

  if (!storedPassword) {
    return false;
  }

  if (storedPassword.startsWith("$2")) {
    return compareAdminPassword(String(password), storedPassword);
  }

  const matches = storedPassword === String(password);

  if (!matches) {
    return false;
  }

  const hashedPassword = await hashAdminPassword(String(password));
  const { error } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", user.id);

  if (error) {
    throw createRequestError(`Failed to upgrade user password hash: ${error.message}`);
  }

  return true;
};

const buildTokenUser = (user) => {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
};

export const registerAdmin = async ({ full_name, email, role, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = normalizeRole(role);

  const existingUser = await fetchUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createRequestError("A user with this email already exists.", 409);
  }

  const hashedPassword = await hashAdminPassword(String(password));
  const { data, error } = await supabase
    .from("users")
    .insert({
      full_name: String(full_name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    })
    .select("id, full_name, email, role, created_at")
    .single();

  if (error) {
    throw createRequestError(`Failed to register user: ${error.message}`);
  }

  return buildTokenUser(data);
};

export const loginAdmin = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await fetchUserByEmail(normalizedEmail);

  if (!user) {
    throw createRequestError("Invalid credentials", 401);
  }

  if (normalizedEmail !== ALLOWED_ADMIN_EMAIL) {
    throw createRequestError(
      "Access denied. Only authorized admin can login.",
      403
    );
  }

  const passwordMatches = await compareAndUpgradePassword(user, password);

  if (!passwordMatches) {
    throw createRequestError("Invalid credentials", 401);
  }

  const safeAdminUser = getSafeAdminUser(buildTokenUser(user));

  return {
    token: signAdminToken(safeAdminUser),
    user: safeAdminUser,
  };
};

export const authenticateAdminToken = async (token) => {
  try {
    const payload = verifyAdminToken(token);
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, created_at")
      .eq("id", payload.sub)
      .maybeSingle();

    if (error) {
      throw createRequestError(`Failed to validate admin user: ${error.message}`);
    }

    const adminUser = data;

    if (!adminUser) {
      throw createRequestError("Admin account not found.", 401);
    }

    if (normalizeEmail(adminUser.email) !== ALLOWED_ADMIN_EMAIL) {
      throw createRequestError(
        "Access denied. Only authorized admin can login.",
        403
      );
    }

    return {
      adminUser,
      tokenPayload: payload,
    };
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw createRequestError("Invalid or expired admin token.", 401);
    }

    throw error;
  }
};
