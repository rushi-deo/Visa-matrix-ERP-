import {
  getSystemStats,
  listAdminUsers,
  listAuditLogs,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "./admin.repository.js";

export const getAdminUsers = async (query) => listAdminUsers(query);
export const getAdminAuditLogs = async (query) => listAuditLogs(query);
export const getAdminSystemStats = async () => getSystemStats();
export const changeAdminUserRole = async (userId, roleId) =>
  updateAdminUserRole(userId, roleId);
export const changeAdminUserStatus = async (userId, isActive) =>
  updateAdminUserStatus(userId, isActive);
