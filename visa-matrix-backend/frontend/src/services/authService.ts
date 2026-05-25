import { requestWithFallback } from "../api/apiClient";
import { unwrapApiData } from "../api/unwrapApi";
import { AUTH_ENDPOINTS } from "../config/api";
import type {
  AuthUser,
  FrontendRole,
  LoginPayload,
  LoginResponse,
  Permission,
  RegisterPayload,
} from "../types";

export type MeResponse = {
  user: AuthUser & {
    full_name?: string;
    organization_id?: string | null;
  };
  role?: string;
  permissions?: string[];
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await requestWithFallback({
    method: "POST",
    url: AUTH_ENDPOINTS.login,
    data: payload,
  });

  return unwrapApiData<LoginResponse>(response.data);
}

export async function register(payload: RegisterPayload) {
  const response = await requestWithFallback({
    method: "POST",
    url: AUTH_ENDPOINTS.register,
    data: payload,
  });

  return unwrapApiData<Record<string, unknown>>(response.data);
}

export async function logout(): Promise<void> {
  try {
    await requestWithFallback({
      method: "POST",
      url: AUTH_ENDPOINTS.logout,
    });
  } catch {
    // Always clear local session even if the server call fails.
  }
}

export async function getCurrentUser(): Promise<MeResponse> {
  const response = await requestWithFallback({
    method: "GET",
    url: AUTH_ENDPOINTS.me,
  });

  return unwrapApiData<MeResponse>(response.data);
}

export async function forgotPassword(email: string) {
  const response = await requestWithFallback({
    method: "POST",
    url: AUTH_ENDPOINTS.forgotPassword,
    data: { email },
  });

  return unwrapApiData<Record<string, unknown>>(response.data);
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await requestWithFallback({
    method: "POST",
    url: AUTH_ENDPOINTS.resetPassword,
    data: { token, newPassword },
  });

  return unwrapApiData<Record<string, unknown>>(response.data);
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const response = await requestWithFallback({
    method: "POST",
    url: AUTH_ENDPOINTS.changePassword,
    data: { oldPassword, newPassword },
  });

  return unwrapApiData<Record<string, unknown>>(response.data);
}

export function hasPermission(
  user: AuthUser | null,
  permission: Permission | Permission[] | string
): boolean {
  if (!user) return false;

  if (user.role === "Super Admin") return true;

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((p) => user.permissions?.includes(String(p)));
}

export function hasRole(user: AuthUser | null, roles: FrontendRole[]): boolean {
  if (!user || !roles || roles.length === 0) return false;
  return roles.includes(user.role as FrontendRole);
}
