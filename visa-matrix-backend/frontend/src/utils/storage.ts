import { STORAGE_KEYS } from "../config/appConfig";
import type { AuthUser } from "../types";

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setStoredToken(token: string) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function clearStoredToken() {
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}
