import { Router } from "express";
import { z } from "zod";
import { authenticateToken } from "../../middleware/rbac.middleware.js";
import { authorizePermissions } from "../../middleware/permission.middleware.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  getSystemStatsController,
  listAdminUsersController,
  listAuditLogsController,
  getCurrentUserController,
  getAllRolesController,
  getRoleByIdController,
  getAllPermissionsController,
  getRolePermissionsController,
  updateRoleController,
  updateRolePermissionsController,
  assignPermissionController,
  removePermissionController,
  updateUserRoleController,
  updateUserStatusController,
} from "./admin.controller.js";

const router = Router();

const usersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});

const auditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
});

const permissionAssignSchema = z.object({
  permissionId: z.string().uuid("Invalid permission ID"),
});

const permissionReplaceSchema = z.object({
  permissionIds: z.array(z.string().uuid("Invalid permission ID")).default([]),
});

const roleUpdateSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    description: z.string().max(300).nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

const userRoleUpdateSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
});

const userStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

// Public endpoint - requires authentication only
router.get("/auth/me", authenticateToken, getCurrentUserController);

// Admin endpoints - authorization is permission-driven from the database.
router.use(authenticateToken);

router.get(
  "/users",
  requestValidator({ query: usersQuerySchema }),
  authorizePermissions("users:view", "settings:view"),
  listAdminUsersController,
);

router.put(
  "/users/:userId/role",
  authorizePermissions("users:edit", "settings:edit"),
  requestValidator({
    params: z.object({ userId: z.string().uuid("Invalid user ID") }),
    body: userRoleUpdateSchema,
  }),
  updateUserRoleController,
);

router.put(
  "/users/:userId/status",
  authorizePermissions("users:edit", "settings:edit"),
  requestValidator({
    params: z.object({ userId: z.string().uuid("Invalid user ID") }),
    body: userStatusUpdateSchema,
  }),
  updateUserStatusController,
);

router.get(
  "/audit-logs",
  requestValidator({ query: auditLogsQuerySchema }),
  authorizePermissions("audit_logs:view", "reports:view"),
  listAuditLogsController,
);

router.get(
  "/system-stats",
  authorizePermissions("settings:view"),
  getSystemStatsController,
);

// Role endpoints
router.get("/roles", authorizePermissions("settings:view"), getAllRolesController);
router.get("/roles/:id", authorizePermissions("settings:view"), getRoleByIdController);
router.put(
  "/roles/:id",
  authorizePermissions("settings:edit"),
  requestValidator({ body: roleUpdateSchema }),
  updateRoleController,
);
router.get(
  "/roles/:id/permissions",
  authorizePermissions("settings:view"),
  getRolePermissionsController,
);
router.put(
  "/roles/:id/permissions",
  authorizePermissions("settings:edit"),
  requestValidator({ body: permissionReplaceSchema }),
  updateRolePermissionsController,
);
router.post(
  "/roles/:id/permissions",
  authorizePermissions("settings:edit"),
  requestValidator({ body: permissionAssignSchema }),
  assignPermissionController,
);
router.delete(
  "/roles/:id/permissions/:permissionId",
  authorizePermissions("settings:edit"),
  removePermissionController,
);

// Permission endpoints
router.get("/permissions", authorizePermissions("settings:view"), getAllPermissionsController);

export default router;
