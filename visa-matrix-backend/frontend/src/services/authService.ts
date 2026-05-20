import { requestWithFallback } from "../api/apiClient";
import { AUTH_ENDPOINTS } from "../config/api";
import type { LoginPayload, LoginResponse, RegisterPayload } from "../types";

export async function login(payload: LoginPayload) {
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
