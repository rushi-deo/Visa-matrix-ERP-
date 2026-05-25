import {
  hasPermissionAccess,
  hasRoleAccess,
  isSuperAdmin,
} from "../config/rbac";
import { useAuth } from "./useAuth";
import type { FrontendRole, Permission } from "../types";

/**
 * Centralized permission checks for UI components.
 */
export function usePermissions() {
  const auth = useAuth();

  const can = (permission: Permission | string): boolean => {
    return hasPermissionAccess(auth.user, permission);
  };

  const canAny = (permissions: (Permission | string)[]): boolean => {
    if (!permissions?.length) {
      return false;
    }

    return permissions.some((permission) => can(permission));
  };

  const canAll = (permissions: (Permission | string)[]): boolean => {
    if (!permissions?.length) {
      return false;
    }

    return permissions.every((permission) => can(permission));
  };

  const hasRole = (roles: FrontendRole[]): boolean => {
    return hasRoleAccess(auth.user?.role, roles);
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
    isSuperAdmin: isSuperAdmin(auth.user?.role),
    permissions: auth.user?.permissions || [],
    role: auth.user?.role,
  };
}

export default usePermissions;
