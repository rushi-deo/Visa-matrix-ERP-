import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import AppLogo from "../common/AppLogo";
import { SIDEBAR_NAVIGATION } from "../../config/appConfig";
import { canAccessNavItem } from "../../config/rbac";
import { useAuth } from "../../hooks/useAuth";

type SidebarNavProps = {
  open: boolean;
  onClose: () => void;
};

export default function SidebarNav({ open, onClose }: SidebarNavProps) {
  const { user } = useAuth();

  const visibleItems = SIDEBAR_NAVIGATION.filter((item) =>
    canAccessNavItem(user, item)
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-30 bg-slate-950/40 transition-opacity duration-300 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-[304px] flex-col transition-transform duration-300 md:static md:translate-x-0",
          "bg-gradient-to-b from-premium-navy-900 to-premium-navy-800",
          "border-r border-premium-blue-500/20",
          "text-white shadow-lg",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-premium-blue-500/15 px-5 py-6">
          <AppLogo />
          <button
            type="button"
            className="rounded-full p-2 text-premium-blue-200 transition-all duration-300 hover:bg-white/10 md:hidden"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-premium px-4 py-3.5",
                  "text-sm font-medium transition-all duration-300",
                  "focus:outline-none focus:ring-premium",
                  isActive
                    ? [
                        "bg-gradient-to-r from-premium-blue-400 to-premium-blue-500",
                        "text-white shadow-lg shadow-premium-blue-500/30",
                        "before:absolute before:inset-0 before:rounded-premium",
                        "before:bg-gradient-to-r before:from-transparent before:to-white/10",
                      ].join(" ")
                    : [
                        "text-premium-blue-100 hover:bg-white/10",
                        "hover:text-white hover:shadow-glow-sm",
                        "active:scale-95",
                      ].join(" "),
                ].join(" ")
              }
              title={
                item.requiredPermission
                  ? `Requires: ${item.requiredPermission}`
                  : undefined
              }
            >
              <item.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Role Information Card */}
        <div className="border-t border-premium-blue-500/15 p-4">
          <div className="rounded-premium border border-premium-blue-400/30 bg-gradient-to-br from-premium-blue-500/15 to-premium-blue-600/10 px-4 py-3.5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-premium-blue-200">
              Role & Permissions
            </p>
            <p className="mt-3 text-sm leading-relaxed text-premium-blue-100">
              <span className="font-semibold">{user?.role || "Unknown"}</span> •{" "}
              <span>{user?.permissions?.length || 0} permissions</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
