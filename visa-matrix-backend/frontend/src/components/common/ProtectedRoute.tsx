import { Navigate, Outlet, useLocation } from "react-router-dom";

import type { FrontendRole, Permission } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import LoadingState from "./LoadingState";

type ProtectedRouteProps = {
  roles?: FrontendRole[];
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
};

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

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check role access
  if (!auth.hasAnyRole(roles)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            Your role does not have access to this resource.
          </p>
        </div>
      </div>
    );
  }

  // Check permission access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? requiredPermissions.every((p) => auth.hasPermission(p))
      : requiredPermissions.some((p) => auth.hasPermission(p));

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600 mt-2">
              You do not have the required permissions to access this resource.
            </p>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
}
