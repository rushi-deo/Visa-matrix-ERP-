import { asyncHandler } from "../../core/errors.js";
import { sendSuccess } from "../../core/response.js";
import {
  changeAdminUserRole,
  changeAdminUserStatus,
  getAdminAuditLogs,
  getAdminSystemStats,
  getAdminUsers,
} from "./admin.service.js";
import { getAllRoles, getRoleById, updateRoleById } from "./role.repository.js";
import {
  getAllPermissions,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  replaceRolePermissions,
} from "./permission.repository.js";

export const listAdminUsersController = asyncHandler(async (req, res) => {
  const data = await getAdminUsers(req.query);
  return sendSuccess(res, data);
});

export const listAuditLogsController = asyncHandler(async (req, res) => {
  const data = await getAdminAuditLogs(req.query);
  return sendSuccess(res, data);
});

export const getSystemStatsController = asyncHandler(async (_req, res) => {
  const data = await getAdminSystemStats();
  return sendSuccess(res, data);
});

/**
 * GET /api/auth/me
 * Get current authenticated user with role and permissions
 */
export const getCurrentUserController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const userData = {
    id: req.user.userId,
    email: req.user.email,
    role: req.user.role,
    permissions: req.user.permissions || [],
    roleId: req.user.roleId || null,
    organization_id: req.user.organization_id || null,
  };

  return sendSuccess(res, userData, {
    message: "Current user fetched successfully",
  });
});

/**
 * GET /api/admin/roles
 * Get all roles with their permissions count
 */
export const getAllRolesController = asyncHandler(async (req, res) => {
  const roles = await getAllRoles();

  const rolesWithPermissions = await Promise.all(
    roles.map(async (role) => {
      const permissions = await getRolePermissions(role.id);
      return {
        ...role,
        permissionCount: permissions.length,
      };
    }),
  );

  return sendSuccess(
    res,
    { items: rolesWithPermissions },
    {
      message: "Roles fetched successfully",
    },
  );
});

/**
 * GET /api/admin/roles/:id
 * Get role by ID with all permissions
 */
export const getRoleByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await getRoleById(id);

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  const permissions = await getRolePermissions(id);

  return sendSuccess(
    res,
    { ...role, permissions },
    {
      message: "Role fetched successfully",
    },
  );
});

/**
 * PUT /api/admin/roles/:id
 * Update editable role metadata
 */
export const updateRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await getRoleById(id);

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  const updatedRole = await updateRoleById(id, req.body);

  if (!updatedRole) {
    return res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }

  return sendSuccess(res, updatedRole, {
    message: "Role updated successfully",
  });
});

/**
 * GET /api/admin/permissions
 * Get all available permissions
 */
export const getAllPermissionsController = asyncHandler(async (req, res) => {
  const permissions = await getAllPermissions();

  return sendSuccess(
    res,
    { items: permissions },
    {
      message: "Permissions fetched successfully",
    },
  );
});

/**
 * GET /api/admin/roles/:id/permissions
 * Get permissions for a specific role
 */
export const getRolePermissionsController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await getRoleById(id);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  const permissions = await getRolePermissions(id);

  return sendSuccess(
    res,
    { role, permissions },
    {
      message: "Role permissions fetched successfully",
    },
  );
});

/**
 * POST /api/admin/roles/:id/permissions
 * Assign permission to role
 * Body: { permissionId: string }
 * Requires: manage_roles permission
 */
export const assignPermissionController = asyncHandler(async (req, res) => {
  const { id: roleId } = req.params;
  const { permissionId } = req.body;

  if (!permissionId) {
    return res.status(400).json({
      success: false,
      message: "permissionId is required",
    });
  }

  const role = await getRoleById(roleId);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  const result = await assignPermissionToRole(roleId, permissionId);

  if (!result) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign permission to role",
    });
  }

  return sendSuccess(res, result, {
    message: "Permission assigned successfully",
  });
});

/**
 * PUT /api/admin/roles/:id/permissions
 * Replace all permissions assigned to a role
 * Body: { permissionIds: string[] }
 */
export const updateRolePermissionsController = asyncHandler(async (req, res) => {
  const { id: roleId } = req.params;
  const { permissionIds = [] } = req.body;

  const role = await getRoleById(roleId);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  const result = await replaceRolePermissions(roleId, permissionIds);

  if (!result) {
    return res.status(500).json({
      success: false,
      message: "Failed to update role permissions",
    });
  }

  const permissions = await getRolePermissions(roleId);

  return sendSuccess(res, { role, permissions }, {
    message: "Role permissions updated successfully",
  });
});

/**
 * DELETE /api/admin/roles/:id/permissions/:permissionId
 * Remove permission from role
 * Requires: manage_roles permission
 */
export const removePermissionController = asyncHandler(async (req, res) => {
  const { id: roleId, permissionId } = req.params;

  const role = await getRoleById(roleId);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  const success = await removePermissionFromRole(roleId, permissionId);

  if (!success) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove permission from role",
    });
  }

  return sendSuccess(
    res,
    { roleId, permissionId },
    {
      message: "Permission removed successfully",
    },
  );
});

/**
 * PUT /api/admin/users/:userId/role
 * Update a user's assigned role
 */
export const updateUserRoleController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  const updatedUser = await changeAdminUserRole(userId, roleId);

  return sendSuccess(res, updatedUser, {
    message: "User role updated successfully",
  });
});

/**
 * PUT /api/admin/users/:userId/status
 * Activate or deactivate a user
 */
export const updateUserStatusController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const updatedUser = await changeAdminUserStatus(userId, Boolean(isActive));

  return sendSuccess(res, updatedUser, {
    message: "User status updated successfully",
  });
});
