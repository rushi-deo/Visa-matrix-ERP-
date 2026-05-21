import { authorizePermissions as rbacAuthorizePermissions } from "./rbac.middleware.js";

/**
 * Permission Authorization Middleware (Deprecated - use rbac.middleware instead)
 * Checks if user has required permissions from JWT token
 * Must be used after authenticateToken middleware
 *
 * This now delegates to the new RBAC middleware for backward compatibility.
 * New code should import from rbac.middleware.js directly.
 *
 * Usage:
 * router.get("/admin/users", authenticateToken, authorizePermissions("users:view"), handler);
 */
export const authorizePermissions = (...requiredPermissions) => {
  return rbacAuthorizePermissions(...requiredPermissions);
};

export default authorizePermissions;
