import {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import * as authService from "../services/authService";
import type {
  AuthUser,
  FrontendRole,
  LoginPayload,
  RegisterPayload,
  Permission,
} from "../types";
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "../utils/storage";
import { normalizeAuthUser } from "../utils/normalizers";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<Record<string, unknown>>;
  forgotPassword: (email: string) => Promise<Record<string, unknown>>;
  logout: () => void;
  hasAnyRole: (roles?: FrontendRole[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    setToken(getStoredToken());
    setUser(getStoredUser());
    setIsBootstrapping(false);
  }, []);

  async function login(payload: LoginPayload) {
    const response = await authService.login(payload);
    const authRecord = response.admin || response.user;

    if (!authRecord || !response.token) {
      throw new Error("The authentication response is missing token details.");
    }

    const normalizedUser = normalizeAuthUser(authRecord);
    setToken(response.token);
    setUser(normalizedUser);
    setStoredToken(response.token);
    setStoredUser(normalizedUser);

    return normalizedUser;
  }

  async function register(payload: RegisterPayload) {
    return authService.register(payload);
  }

  async function forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  function logout() {
    setToken(null);
    setUser(null);
    clearStoredToken();
    clearStoredUser();
  }

  function hasAnyRole(roles?: FrontendRole[]) {
    if (!roles || roles.length === 0) {
      return true;
    }

    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }

  function hasPermission(permission: Permission | Permission[]): boolean {
    if (!user) {
      return false;
    }

    // Super Admin has all permissions
    if (user.role === "Super Admin") {
      return true;
    }

    const permissionArray = Array.isArray(permission)
      ? permission
      : [permission];
    return permissionArray.some((p) => user.permissions?.includes(p));
  }

  function hasAnyPermission(permissions: Permission[]): boolean {
    if (!user || !permissions || permissions.length === 0) {
      return false;
    }

    // Super Admin has all permissions
    if (user.role === "Super Admin") {
      return true;
    }

    return permissions.some((p) => user.permissions?.includes(p));
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isBootstrapping,
        login,
        register,
        forgotPassword,
        logout,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
