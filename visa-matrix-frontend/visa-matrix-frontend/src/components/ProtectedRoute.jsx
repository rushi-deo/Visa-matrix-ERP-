import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  module,
  action = "view",
  allowedRoles = [],
  fallbackTitle = "Access Restricted",
}) {
  const { canAccess, hasRole, loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <DashboardLayout>
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>Loading access profile</h3>
              <p>Checking role, permissions, and organization scope.</p>
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    // eslint-disable-next-line no-console
    console.log("ProtectedRoute: no currentUser, redirecting to /login", location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // eslint-disable-next-line no-console
    console.log("ProtectedRoute: user lacks allowedRoles", { allowedRoles, pathname: location.pathname });
    return (
      <DashboardLayout>
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>{fallbackTitle}</h3>
              <p>{currentUser?.name ?? "Current user"} is not assigned to this role group.</p>
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (module && !canAccess(module, action)) {
    // eslint-disable-next-line no-console
    console.log("ProtectedRoute: user lacks module access", { module, action, pathname: location.pathname });
    return (
      <DashboardLayout>
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>{fallbackTitle}</h3>
              <p>
                {currentUser?.name ?? "Current user"} does not have `{action}` access for the
                `{module}` module.
              </p>
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  return children;
}
