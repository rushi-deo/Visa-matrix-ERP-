import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
  canAccessRoute,
  hasPermissionAccess,
  hasRoleAccess,
  isAuthenticatedUser,
} from "../../config/rbac";
import type { FrontendRole, Permission } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import LoadingState from "./LoadingState";

type ProtectedRouteProps = {
  roles?: FrontendRole[];
  requiredPermissions?: (Permission | string)[];
  requireAllPermissions?: boolean;
};

function debugRouteCheck(message: string, payload: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug(`[RBAC][ProtectedRoute] ${message}`, payload);
  }
}

export default function ProtectedRoute({
  roles,
  requiredPermissions,
  requireAllPermissions = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const auth = useAuth();

  if (auth.isBootstrapping) {
    return <LoadingState label="Restoring your Visa Matrix session..." />;
  }

  if (!isAuthenticatedUser(auth.user, auth.token)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const explicitRoleOk = hasRoleAccess(auth.user?.role, roles);
  const explicitPermOk =
    !requiredPermissions?.length ||
    (requireAllPermissions
      ? requiredPermissions.every((permission) =>
          hasPermissionAccess(auth.user, permission),
        )
      : requiredPermissions.some((permission) =>
          hasPermissionAccess(auth.user, permission),
        ));

  const routeOk = canAccessRoute(auth.user, location.pathname);
  const accountsAccess = location.pathname.startsWith("/accounts")
    ? canAccessRoute(auth.user, "/accounts")
    : null;

  debugRouteCheck("check", {
    pathname: location.pathname,
    userRole: auth.user?.role,
    permissions: auth.user?.permissions,
    explicitRoleOk,
    explicitPermOk,
    routeOk,
    accountsAccess,
    requiredPermissions,
    roles,
  });

  if (!explicitRoleOk || !explicitPermOk || !routeOk) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
