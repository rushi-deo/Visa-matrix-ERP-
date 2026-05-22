import { requestWithFallback } from "../api/apiClient";
import { AUTH_ENDPOINTS } from "../config/api";
import type { LoginPayload, LoginResponse, RegisterPayload, AuthUser, Permission, FrontendRole } from "../types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await requestWithFallback<LoginResponse>({
    method: "POST",
    url: AUTH_ENDPOINTS.login,
    data: payload,
  });

  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: AUTH_ENDPOINTS.register,
    data: payload,
  });

  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: AUTH_ENDPOINTS.forgotPassword,
    data: { email },
  });

  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: `${AUTH_ENDPOINTS.resetPassword}`,
    data: { token, newPassword },
  });

  return response.data;
}

/**
 * Change password
 */
export async function changePassword(oldPassword: string, newPassword: string) {
  const response = await requestWithFallback<Record<string, unknown>>({
    method: "POST",
    url: `${AUTH_ENDPOINTS.changePassword}`,
    data: { oldPassword, newPassword },
  });

  return response.data;
}

/**
 * Check if user has permission
 */
export function hasPermission(
  user: AuthUser | null,
  permission: Permission | Permission[]
): boolean {
  if (!user) return false;

  // Super Admin has all permissions
  if (user.role === "Super Admin") return true;

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((p) => user.permissions?.includes(p));
}

/**
 * Check if user has any role
 */
export function hasRole(user: AuthUser | null, roles: FrontendRole[]): boolean {
  if (!user || !roles || roles.length === 0) return false;
  return roles.includes(user.role as FrontendRole);
}
