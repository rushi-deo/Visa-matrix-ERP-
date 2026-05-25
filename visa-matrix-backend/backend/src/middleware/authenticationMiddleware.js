/**
 * Enhanced Authentication Middleware
 * Validates JWT tokens, session, and user status
 */

import jwt from "jsonwebtoken";
import env from "../config/env.js";
import supabase from "../config/supabase.js";
import {
  hasRoleAccess,
  isSuperAdminRole,
  normalizeEnterpriseRole,
} from "../config/rbac.js";

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, env.jwtSecret);

    // Fetch user profile to check status
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: `Account is ${user.status}. Please contact support.`,
      });
    }

    // Check if user is locked
    if (user.is_locked) {
      return res.status(403).json({
        success: false,
        error: "Account is locked. Please reset your password or contact support.",
      });
    }

    // Set user in request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      ...user,
    };

    // Update last activity
    await supabase
      .from("profiles")
      .update({
        last_active_at: new Date().toISOString(),
      })
      .eq("id", decoded.userId)
      .throwOnError();

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
}

/**
 * Verify user has specific role
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!hasRoleAccess(normalizeEnterpriseRole(req.user.role), roles)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

/**
 * Verify user has specific permission
 */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (isSuperAdminRole(req.user.role)) {
      return next();
    }

    const userPermissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
}

/**
 * Verify user is Super Admin
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  if (!isSuperAdminRole(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Super Admin access required",
    });
  }

  next();
}

/**
 * Optional authentication - doesn't fail if not authenticated
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const { data: user } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (user) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
        ...user,
      };
    }

    next();
  } catch (error) {
    next();
  }
}

export default authenticateToken;
