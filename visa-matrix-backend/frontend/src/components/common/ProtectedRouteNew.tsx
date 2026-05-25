import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { isAuthenticatedUser } from "../../config/rbac";
import { useAuth } from "../../hooks/useAuth";
import type { FrontendRole, Permission } from "../../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: FrontendRole[];
  requiredPermissions?: Permission | Permission[];
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute - Prevents unauthorized access to routes
 * Checks user role and permissions before rendering
 */
export default function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  fallback,
}: ProtectedRouteProps) {
  const { user, token, isBootstrapping, hasPermission, hasAnyRole } = useAuth();
  const isAuthenticated = isAuthenticatedUser(user, token);
  const location = useLocation();

  // Show nothing while bootstrapping
  if (isBootstrapping) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Check if user has required permission
  if (requiredPermissions && !hasPermission(requiredPermissions)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * PermissionGate - Conditionally renders content based on permissions
 * Unlike ProtectedRoute, it doesn't redirect but hides content
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission | Permission[];
  role?: FrontendRole[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  role,
  fallback,
}: PermissionGateProps) {
  const { hasPermission, hasAnyRole } = useAuth();

  let hasAccess = true;

  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (role && !hasAnyRole(role)) {
    hasAccess = false;
  }

  return <>{hasAccess ? children : fallback}</>;
}

/**
 * RoleGate - Conditionally renders content based on user role
 */
interface RoleGateProps {
  children: React.ReactNode;
  roles: FrontendRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, roles, fallback }: RoleGateProps) {
  const { hasAnyRole } = useAuth();
  return <>{hasAnyRole(roles) ? children : fallback}</>;
}

/**
 * SuperAdminOnly - Only Super Admin can see this
 */
interface SuperAdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuperAdminOnly({ children, fallback }: SuperAdminOnlyProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "Super Admin";
  return <>{isSuperAdmin ? children : fallback}</>;
}

/**
 * Unauthorized page
 */
export function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
        <p className="text-xl text-gray-600 mb-6">Unauthorized Access</p>
        <p className="text-gray-500 mb-8">
          You don't have permission to access this resource.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
