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
    <div className={[
      "min-h-screen text-premium-navy-950",
      "lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]",
      "bg-gradient-to-br from-premium-platinum-50 via-premium-platinum-100 to-premium-platinum-50",
    ].join(" ")}>
      {/* Left Panel - Hero/Branding */}
      <section className={[
        "relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col",
        "bg-gradient-to-br from-premium-navy-900 to-premium-navy-800",
      ].join(" ")}>
        <div className={[
          "absolute inset-0 opacity-40",
          "bg-gradient-to-br from-premium-blue-500/30 to-premium-blue-600/10",
        ].join(" ")} />
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-premium-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-premium-blue-600/10 blur-3xl" />
        
        <div className="relative z-10">
          <AppLogo />
          <div className="mt-20 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-premium-blue-200">
              Visa Processing ERP
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
              Manage global visa operations from a single enterprise control plane.
            </h1>
            <p className="mt-6 text-lg leading-8 text-premium-blue-100/85">
              Visa Matrix combines intake, compliance, payments, workflows, reporting, and team collaboration in one secure dashboard.
            </p>
            
            {/* Features Grid */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { label: "Fast Processing", icon: "⚡" },
                { label: "Secure", icon: "🔒" },
                { label: "Enterprise", icon: "🏢" },
                { label: "24/7 Support", icon: "📞" },
              ].map((feature) => (
                <div 
                  key={feature.label}
                  className="rounded-premium border border-premium-blue-500/20 bg-premium-blue-500/10 p-3 backdrop-blur-sm"
                >
                  <p className="text-2xl">{feature.icon}</p>
                  <p className="mt-2 text-xs font-semibold text-premium-blue-200">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel - Auth Form */}
      <section className={[
        "flex min-h-screen items-center justify-center p-6 lg:p-10",
        "bg-gradient-to-br from-premium-platinum-50 to-white",
      ].join(" ")}>
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
