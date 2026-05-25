const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
);

export const API_BASE_PATH = "/api";
export const API_ROOT_URL = `${API_BASE_URL}${API_BASE_PATH}`;
export const API_PROXY_BASE_URL = API_BASE_PATH;
export const API_FALLBACK_BASE_URLS = [
  API_PROXY_BASE_URL,
  "http://127.0.0.1:5000/api",
] as const;

export const EMPLOYEE_ENDPOINTS = {
  base: "/employees",
  dashboard: "/employees/dashboard",
  options: "/employees/options",
} as const;

export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  me: "/auth/me",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  changePassword: "/auth/change-password",
} as const;
