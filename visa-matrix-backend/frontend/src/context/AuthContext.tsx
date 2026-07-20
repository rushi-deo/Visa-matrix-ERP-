import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { setUnauthorizedHandler } from "../api/apiClient";
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
import {
  hasPermissionAccess,
  hasRoleAccess,
  isAuthenticatedUser,
  isGuest,
} from "../config/rbac";
import { normalizeAuthUser } from "../utils/normalizers";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<Record<string, unknown>>;
  forgotPassword: (email: string) => Promise<Record<string, unknown>>;
  logout: () => Promise<void>;
  hasAnyRole: (roles?: FrontendRole[]) => boolean;
  hasPermission: (permission: Permission | Permission[] | string) => boolean;
  hasAnyPermission: (permissions: (Permission | string)[]) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function debugAuthEvent(message: string, payload: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug(`[RBAC][AuthContext] ${message}`, payload);
  }
}

function userFromMeResponse(me: authService.MeResponse): AuthUser {
  const profile = me.user;
  return normalizeAuthUser({
    id: profile.id,
    email: profile.email,
    full_name: profile.name || (profile as { full_name?: string }).full_name,
    role: me.role || profile.role || profile.rawRole,
    permissions: me.permissions || profile.permissions,
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredToken();
    clearStoredUser();
  }, []);

  const applySession = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setStoredToken(nextToken);
    setStoredUser(nextUser);
    debugAuthEvent("applySession", {
      role: nextUser.role,
      permissions: nextUser.permissions,
      tokenPresent: Boolean(nextToken),
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (!storedToken) {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      setToken(storedToken);
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const me = await authService.getCurrentUser();
        if (cancelled) {
          return;
        }

        const refreshedUser = userFromMeResponse(me);
        debugAuthEvent("restoreSession:user", {
          role: refreshedUser.role,
          permissions: refreshedUser.permissions,
        });
        applySession(storedToken, refreshedUser);
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  async function login(payload: LoginPayload) {
    const response = await authService.login(payload);
    const authRecord = response.user || response.admin;

    if (!authRecord || !response.token) {
      throw new Error("The authentication response is missing token details.");
    }

    const normalizedUser = normalizeAuthUser({
      ...authRecord,
      permissions: authRecord.permissions,
    });

    debugAuthEvent("login:user", {
      role: normalizedUser.role,
      permissions: normalizedUser.permissions,
    });

    if (isGuest(normalizedUser.role)) {
      throw new Error("Guest accounts cannot access the employee portal.");
    }

    applySession(response.token, normalizedUser);
    return normalizedUser;
  }

  async function register(payload: RegisterPayload) {
    return authService.register(payload);
  }

  async function forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  async function logout() {
    await authService.logout();
    clearSession();
  }

  function hasAnyRole(roles?: FrontendRole[]) {
    return hasRoleAccess(user?.role, roles);
  }

  function hasPermission(permission: Permission | Permission[] | string) {
    return hasPermissionAccess(user, permission);
  }

  function hasAnyPermission(permissions: (Permission | string)[]) {
    if (!user || !permissions?.length) {
      return false;
    }

    return permissions.some((entry) => hasPermission(entry));
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: isAuthenticatedUser(user, token),
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
