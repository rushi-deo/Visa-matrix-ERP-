import jwt from "jsonwebtoken";
import env from "../config/env.js";
import supabase from "../config/supabase.js";

const normalizeRole = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const normalizeRequiredPermissions = (requiredPermissions = []) => {
  if (
    requiredPermissions.length === 2 &&
    requiredPermissions.every((permission) => !String(permission).includes(":"))
  ) {
    return [`${requiredPermissions[0]}:${requiredPermissions[1]}`];
  }

  return requiredPermissions;
};

const loadUserAccessProfile = async (userId, decoded) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
        id,
        auth_user_id,
        email,
        role,
        organization_id,
        is_active,
        status,
        user_roles(role_id, roles(id, code, name, description))
      `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error loading access profile:", profileError);
  }

  if (profile && (profile.is_active === false || profile.status === "inactive")) {
    return {
      blocked: true,
      message: "User account is inactive",
    };
  }

  const assignedRole = profile?.user_roles?.[0]?.roles || null;
  const roleId = assignedRole?.id || null;
  let permissions = [];

  if (roleId) {
    const { data: rolePermissions, error: permissionError } = await supabase
      .from("role_permissions")
      .select("permissions(name)")
      .eq("role_id", roleId);

    if (permissionError) {
      console.error("Error loading role permissions:", permissionError);
    }

    permissions = (rolePermissions || [])
      .map((item) => item.permissions?.name)
      .filter(Boolean);
  } else if (Array.isArray(decoded.permissions)) {
    permissions = decoded.permissions;
  }

  return {
    blocked: false,
    user: {
      userId,
      authUserId: profile?.auth_user_id || decoded.authUserId || null,
      email: profile?.email || decoded.email,
      role: assignedRole?.name || assignedRole?.code || profile?.role || decoded.role,
      roleCode: assignedRole?.code || normalizeRole(profile?.role || decoded.role),
      roleId,
      organization_id: profile?.organization_id || decoded.organization_id || null,
      permissions,
    },
  };
};

/**
 * Authenticate User Middleware
 * Validates JWT token and extracts user info (userId, email, role, permissions)
 * Attaches decoded user to req.user and req.auth
 * 
 * Usage: router.use(authenticateToken)
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7).trim();

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        message:
          verifyError.name === "TokenExpiredError"
            ? "Token has expired"
            : "Invalid token",
      });
    }

    const userId = decoded.userId || decoded.sub;
    const accessProfile = await loadUserAccessProfile(userId, decoded);

    if (accessProfile.blocked) {
      return res.status(403).json({
        success: false,
        message: accessProfile.message,
      });
    }

    // Attach DB-backed user info to request.
    req.user = accessProfile.user;

    // Also attach to req.auth for backward compatibility
    req.auth = {
      ...accessProfile.user,
      token,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Authorization Middleware - Check User Roles
 * Verifies user has one of the required roles
 * Must be used after authenticateToken
 * 
 * Usage: router.get("/admin", authenticateToken, authorizeRoles("Admin", "Super Admin"), handler)
 */
export const authorizeRoles = (...allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return (_req, _res, next) => next();
  }

  return (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      const userRole = normalizeRole(req.user.role || req.user.roleCode);
      const allowedRoleSet = new Set(allowedRoles.map(normalizeRole));

      // Check if user has one of the allowed roles
      if (!allowedRoleSet.has(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}. Your role: ${userRole}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};

/**
 * Authorization Middleware - Check Permissions
 * Verifies user has at least one of the required permissions from JWT
 * Super Admin role grants all permissions automatically
 * Must be used after authenticateToken
 * 
 * Usage: router.get("/users", authenticateToken, authorizePermissions("users:view"), handler)
 */
export const authorizePermissions = (...requiredPermissions) => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return (_req, _res, next) => next();
  }

  return (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "User authentication required",
        });
      }

      const userPermissions = req.user.permissions || [];
      const normalizedRequiredPermissions =
        normalizeRequiredPermissions(requiredPermissions);

      if (userPermissions.includes("*")) {
        return next();
      }

      // Check if user has at least one required permission
      const hasPermission = normalizedRequiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${normalizedRequiredPermissions.join(", ")}. Your permissions: ${userPermissions.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};

/**
 * Authorization Middleware - Require Super Admin
 * Convenience middleware for super admin-only operations
 * Must be used after authenticateToken
 * 
 * Usage: router.delete("/system/reset", authenticateToken, requireSuperAdmin, handler)
 */
export const requireSuperAdmin = (req, res, next) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!["super_admin", "super admin"].includes(normalizeRole(req.user.role || req.user.roleCode))) {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Super admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

export default {
  authenticateToken,
  authorizeRoles,
  authorizePermissions,
  requireSuperAdmin,
};
