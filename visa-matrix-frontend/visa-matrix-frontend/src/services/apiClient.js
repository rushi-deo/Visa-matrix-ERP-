import axios from "axios";
import { AUTH_STORAGE_KEY } from "../data/accessControl";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:5000/api";

export const API_ENDPOINTS = {
  applications: "/applications",
  applicationById: (applicationId) => `/applications/${applicationId}`,
  documents: "/documents",
  documentsUpload: "/documents/upload",
  documentsByApplication: (applicationId) => `/applications/${applicationId}/documents`,
  invoices: "/invoices",
  invoiceStatus: (invoiceId) => `/invoices/${invoiceId}/status`,
};

export function getStoredAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

export function storeAuthSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session?.token || !session?.user) {
    clearStoredAuthSession();
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return getStoredAuthSession()?.token ?? "";
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function extractResponseData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function decodeJwtPayload(token = "") {
  try {
    const payload = token.split(".")[1];
    if (!payload || typeof window === "undefined") {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token = "") {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function dispatchSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("visa-matrix:auth-expired"));
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = {
    ...config,
    headers: {
      ...(config.headers ?? {}),
    },
  };
  const token = getStoredToken();

  if (token && isTokenExpired(token)) {
    clearStoredAuthSession();
    dispatchSessionExpired();
    return Promise.reject(new Error("Authentication session has expired."));
  }

  if (token && !nextConfig.headers.Authorization) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }

  if (
    nextConfig.data &&
    typeof FormData !== "undefined" &&
    nextConfig.data instanceof FormData
  ) {
    delete nextConfig.headers["Content-Type"];
  } else if (
    nextConfig.data &&
    !nextConfig.headers["Content-Type"] &&
    nextConfig.method &&
    nextConfig.method.toLowerCase() !== "get"
  ) {
    nextConfig.headers["Content-Type"] = "application/json";
  }

  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuthSession();
      dispatchSessionExpired();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
