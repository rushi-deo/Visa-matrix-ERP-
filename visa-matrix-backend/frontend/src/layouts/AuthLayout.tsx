import { Navigate, Outlet, useLocation } from "react-router-dom";

import AppLogo from "../components/common/AppLogo";
import LoadingState from "../components/common/LoadingState";
import { isAuthenticatedUser } from "../config/rbac";
import { useAuth } from "../hooks/useAuth";

export default function AuthLayout() {
  const location = useLocation();
  const { user, token, isBootstrapping } = useAuth();
  const isAuthenticated = isAuthenticatedUser(user, token);

  if (isBootstrapping) {
    return <LoadingState label="Checking your session..." />;
  }

  if (isAuthenticated) {
    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="relative hidden overflow-hidden bg-[#0B2E59] p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,128,237,0.35),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(30,91,184,0.24),transparent_34%)]" />
        <div className="relative z-10">
          <AppLogo />
          <div className="mt-20 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-200">
              Visa Processing ERP
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight">
              Manage global visa operations from a single enterprise control plane.
            </h1>
            <p className="mt-6 text-lg leading-8 text-sky-100/85">
              Visa Matrix combines intake, compliance, payments, workflows, reporting, and team collaboration in one secure dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-lg">
          <div className="mb-10 lg:hidden">
            <AppLogo compact />
          </div>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
