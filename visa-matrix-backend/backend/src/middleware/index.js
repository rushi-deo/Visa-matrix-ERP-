/**
 * RBAC Middleware Index
 * Central export for all authentication and authorization middleware
 *
 * Replaces:
 * - auth.js
 * - authMiddleware.js
 * - authenticateUser.js
 * - rbac.js
 * - authorizeRoles.js
 * - permissionMiddleware.js
 * - permission.middleware.js
 *
 * Usage:
 * import { authenticateToken, authorizeRoles, authorizePermissions } from './index.js';
 *
 * router.get('/admin', authenticateToken, authorizeRoles('Admin'), handler);
 * router.get('/users', authenticateToken, authorizePermissions('users:view'), handler);
 */

export {
  authenticateToken,
  authorizeRoles,
  authorizePermissions,
  requireSuperAdmin,
} from "./rbac.middleware.js";

// For backward compatibility, also export as default objects
import {
  authenticateToken,
  authorizeRoles,
  authorizePermissions,
  requireSuperAdmin,
} from "./rbac.middleware.js";

export const rbac = {
  authenticateToken,
  authorizeRoles,
  authorizePermissions,
  requireSuperAdmin,
};

export default rbac;
