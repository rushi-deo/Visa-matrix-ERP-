import { useAuth } from "./useAuth";
import type { Permission } from "../types";

/**
 * Hook to check user permissions
 * Usage:
 * const { can, canAny, canAll } = usePermissions();
 * if (can("manage_users")) { ... }
 */
export function usePermissions() {
  const auth = useAuth();

  const can = (permission: Permission): boolean => {
    if (!auth.user) {
      return false;
    }

    // Super Admin has all permissions
    if (auth.user.role === "Super Admin") {
      return true;
    }

    return auth.user.permissions?.includes(permission) ?? false;
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!permissions || permissions.length === 0) {
      return false;
    }

    return permissions.some((p) => can(p));
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!permissions || permissions.length === 0) {
      return false;
    }

    return permissions.every((p) => can(p));
  };

  return {
    can,
    canAny,
    canAll,
    permissions: auth.user?.permissions || [],
    role: auth.user?.role,
  };
}

export default usePermissions;
