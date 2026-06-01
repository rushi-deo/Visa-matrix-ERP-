import * as React from "react";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  storeAuthSession,
} from "@erp/services/apiClient";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  signOutUser,
} from "@erp/services/authService";

export type Role = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
  avatar?: string;
  [key: string]: unknown;
}

interface AuthSession {
  token: string;
  user: User;
  session?: Record<string, unknown> | null;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  fullName: string;
  phone?: string;
  role?: string;
}

interface Ctx {
  user: User | null;
  role: Role;
  permissions: string[];
  token: string;
  isHydrated: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<AuthSession>;
  register: (payload: RegisterInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  verifySession: () => Promise<User | null>;
  isAuthenticatedUser: () => boolean;
  hasRole: (allowedRoles?: string[]) => boolean;
  canAccess: (moduleName: string, action?: string) => boolean;
}

const AuthCtx = React.createContext<Ctx | null>(null);

const normalizeRole = (role = "") =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const normalizeRoleCode = (role = "") => normalizeRole(role).replace(/\s+/g, "_");

const normalizePermission = (permission = "") => String(permission || "").trim();

function decodeJwtPayload(token = "") {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function isTokenExpired(token = "") {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

function displayName(user: Record<string, unknown>) {
  return (
    user.name ??
    user.full_name ??
    user.fullName ??
    user.email ??
    "Visa Matrix User"
  );
}

function normalizeUser(user: Record<string, unknown> = {}, token = ""): User {
  const tokenPayload = decodeJwtPayload(token) ?? {};
  const permissions = [
    ...new Set(
      [
        ...(Array.isArray(user.permissions) ? user.permissions : []),
        ...(Array.isArray(tokenPayload.permissions) ? tokenPayload.permissions : []),
      ].map(normalizePermission).filter(Boolean),
    ),
  ];
  const role = String(user.role ?? tokenPayload.role ?? "Employee");
  const email = String(user.email ?? tokenPayload.email ?? "");

  return {
    ...user,
    id: String(user.id ?? user.userId ?? tokenPayload.userId ?? tokenPayload.sub ?? email),
    name: String(displayName(user)),
    email,
    role,
    permissions,
  };
}

function normalizeSession(session: { token?: string; user?: Record<string, unknown>; session?: Record<string, unknown> | null }): AuthSession {
  if (!session?.token || !session?.user) {
    throw new Error("Authentication response did not include a valid session.");
  }

  return {
    token: session.token,
    user: normalizeUser(session.user, session.token),
    session: session.session ?? null,
  };
}

function permissionMatches(permission: string, moduleName: string, action: string) {
  const normalized = normalizePermission(permission);
  const modulePermission = `${moduleName}:${action}`;

  return normalized === "*" || normalized === modulePermission;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState("");
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const applySession = React.useCallback((nextSession: AuthSession | null) => {
    if (!nextSession?.token || !nextSession?.user || isTokenExpired(nextSession.token)) {
      clearStoredAuthSession();
      setUser(null);
      setToken("");
      return null;
    }

    storeAuthSession(nextSession);
    setUser(nextSession.user);
    setToken(nextSession.token);
    return nextSession.user;
  }, []);

  const clearSession = React.useCallback(() => {
    clearStoredAuthSession();
    setUser(null);
    setToken("");
  }, []);

  const verifySession = React.useCallback(async () => {
    const storedSession = getStoredAuthSession();

    if (!storedSession?.token || isTokenExpired(storedSession.token)) {
      clearSession();
      return null;
    }

    try {
      const profile = await fetchCurrentUser();
      const verifiedSession = normalizeSession({
        token: storedSession.token,
        session: storedSession.session ?? null,
        user: {
          ...(storedSession.user ?? {}),
          ...(profile.user ?? {}),
          role: profile.role ?? profile.user?.role ?? storedSession.user?.role,
          permissions: profile.permissions ?? profile.user?.permissions ?? storedSession.user?.permissions,
        },
      });

      applySession(verifiedSession);
      return verifiedSession.user;
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  React.useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setLoading(true);
      const restoredUser = await verifySession();

      if (!cancelled) {
        if (!restoredUser) {
          clearSession();
        }
        setIsHydrated(true);
        setLoading(false);
      }
    }

    restoreSession();

    const handleExpiredSession = () => {
      clearSession();
    };

    window.addEventListener("visa-matrix:auth-expired", handleExpiredSession);

    return () => {
      cancelled = true;
      window.removeEventListener("visa-matrix:auth-expired", handleExpiredSession);
    };
  }, [clearSession, verifySession]);

  const login = React.useCallback(
    async (credentials: LoginInput) => {
      setLoading(true);

      try {
        const authSession = normalizeSession(await loginUser(credentials));
        applySession(authSession);
        await verifySession();
        return authSession;
      } finally {
        setLoading(false);
      }
    },
    [applySession, verifySession],
  );

  const register = React.useCallback(
    async (payload: RegisterInput) => {
      setLoading(true);

      try {
        const authSession = normalizeSession(await registerUser(payload));
        applySession(authSession);
        await verifySession();
        return authSession;
      } finally {
        setLoading(false);
      }
    },
    [applySession, verifySession],
  );

  const logout = React.useCallback(async () => {
    try {
      if (token) {
        await signOutUser();
      }
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const permissions = React.useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const role = user?.role ?? "";

  const hasRole = React.useCallback(
    (allowedRoles: string[] = []) => {
      if (!allowedRoles.length) return true;
      if (!user?.role) return false;

      const currentRole = normalizeRole(user.role);
      const currentRoleCode = normalizeRoleCode(user.role);

      if (currentRoleCode === "super_admin") return true;

      return allowedRoles.some((allowedRole) => {
        const allowed = normalizeRole(allowedRole);
        return allowed === currentRole || normalizeRoleCode(allowedRole) === currentRoleCode;
      });
    },
    [user?.role],
  );

  const canAccess = React.useCallback(
    (moduleName: string, action = "view") => {
      if (!user) return false;
      if (normalizeRoleCode(user.role) === "super_admin") return true;
      return permissions.some((permission) => permissionMatches(permission, moduleName, action));
    },
    [permissions, user],
  );

  const value = React.useMemo<Ctx>(
    () => ({
      user,
      role,
      permissions,
      token,
      isHydrated,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      verifySession,
      isAuthenticatedUser: () => Boolean(user && token),
      hasRole,
      canAccess,
    }),
    [
      canAccess,
      hasRole,
      isHydrated,
      loading,
      login,
      logout,
      permissions,
      register,
      role,
      token,
      user,
      verifySession,
    ],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthCtx);
  if (!context) throw new Error("useAuth outside AuthProvider");
  return context;
}
