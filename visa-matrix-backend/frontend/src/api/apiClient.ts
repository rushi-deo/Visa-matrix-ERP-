import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

import { STORAGE_KEYS } from "../config/appConfig";
import {
  API_FALLBACK_BASE_URLS,
  API_ROOT_URL,
} from "../config/api";

const primaryBaseUrl = API_ROOT_URL;

const fallbackBaseUrls = [
  import.meta.env.VITE_API_FALLBACK_URL,
  ...API_FALLBACK_BASE_URLS,
].filter((value, index, list): value is string => {
  return Boolean(value) && value !== primaryBaseUrl && list.indexOf(value) === index;
});

const apiClient = axios.create({
  baseURL: primaryBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = String(error.config?.url || "");
      const isAuthRequest = /\/auth\/(login|register|forgot-password)/.test(
        requestUrl
      );

      if (!isAuthRequest) {
        unauthorizedHandler?.();
      }
    }

    return Promise.reject(error);
  }
);

function shouldRetry(error: AxiosError) {
  return !error.response || error.response.status === 404;
}

function extractErrorMessage(error: AxiosError) {
  const payload = error.response?.data;

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
  }

  return error.message || "Request failed";
}

export async function requestWithFallback<T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const baseUrls = [primaryBaseUrl, ...fallbackBaseUrls];
  let lastError: AxiosError | null = null;

  for (let index = 0; index < baseUrls.length; index += 1) {
    const baseURL = baseUrls[index];

    try {
      return await apiClient.request<T>({
        ...config,
        baseURL,
      });
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      lastError = error;

      if (!shouldRetry(error) || index === baseUrls.length - 1) {
        throw new Error(extractErrorMessage(error));
      }
    }
  }

  throw new Error(lastError ? extractErrorMessage(lastError) : "Request failed");
}

export default apiClient;
