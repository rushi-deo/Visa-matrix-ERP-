import { requestWithFallback } from "../api/apiClient";
import type {
  ApplicationDetail,
  ApplicationListResponse,
  DashboardSummary,
  Role,
  PermissionDef,
  AuthUser,
} from "../types";

// Dashboard endpoints
export async function fetchDashboardSummary() {
  const response = await requestWithFallback<DashboardSummary>({
    method: "GET",
    url: "/admin/dashboard/summary",
  });

  return response.data;
}

export async function fetchAdminApplications(page = 1, limit = 10) {
  const response = await requestWithFallback<ApplicationListResponse>({
    method: "GET",
    url: "/admin/applications",
    params: { page, limit },
  });

  return response.data;
}

export async function fetchApplicationByReference(referenceNo: string) {
  const response = await requestWithFallback<ApplicationDetail>({
    method: "GET",
    url: `/admin/application/${referenceNo}`,
  });

  return response.data;
}

export async function updateApplicationStatus(id: string, status: string) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "PATCH",
    url: `/admin/application/${id}/status`,
    data: { status },
  });

  return response.data;
}

// RBAC endpoints - Authentication
export async function getCurrentUser() {
  const response = await requestWithFallback<AuthUser>({
    method: "GET",
    url: "/auth/me",
  });

  return response.data;
}

// RBAC endpoints - Roles
export async function fetchAllRoles() {
  const response = await requestWithFallback<{ items: Role[] }>({
    method: "GET",
    url: "/admin/roles",
  });

  return response.data?.items || [];
}

export async function fetchRoleById(roleId: string) {
  const response = await requestWithFallback<
    Role & { permissions: PermissionDef[] }
  >({
    method: "GET",
    url: `/admin/roles/${roleId}`,
  });

  return response.data;
}

export async function fetchRolePermissions(roleId: string) {
  const response = await requestWithFallback<{
    role: Role;
    permissions: PermissionDef[];
  }>({
    method: "GET",
    url: `/admin/roles/${roleId}/permissions`,
  });

  return response.data;
}

// RBAC endpoints - Permissions
export async function fetchAllPermissions() {
  const response = await requestWithFallback<{ items: PermissionDef[] }>({
    method: "GET",
    url: "/admin/permissions",
  });

  return response.data?.items || [];
}

export async function assignPermissionToRole(
  roleId: string,
  permissionId: string,
) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: `/admin/roles/${roleId}/permissions`,
    data: { permissionId },
  });

  return response.data;
}

export async function removePermissionFromRole(
  roleId: string,
  permissionId: string,
) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "DELETE",
    url: `/admin/roles/${roleId}/permissions/${permissionId}`,
  });

  return response.data;
}
