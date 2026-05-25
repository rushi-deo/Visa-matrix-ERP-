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
      <div
        className={[
          "fixed inset-0 z-30 bg-slate-950/40 transition md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-[304px] flex-col border-r border-white/10 bg-[#0B2E59] px-5 py-6 text-white transition md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="mb-8 flex items-center justify-between">
          <AppLogo />
          <button
            type="button"
            className="rounded-full p-2 text-sky-100 md:hidden"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-[#0B2E59] shadow-lg shadow-slate-950/30"
                    : "text-sky-100 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
              title={
                item.requiredPermission
                  ? `Requires: ${item.requiredPermission}`
                  : undefined
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
            Role & Permissions
          </p>
          <p className="mt-3 text-sm leading-6 text-sky-100">
            {user?.role || "Unknown"} • {user?.permissions?.length || 0}{" "}
            permissions
          </p>
        </div>
      </aside>
    </>
  );
}
