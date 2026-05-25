import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";

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
  const location = useLocation();

  // State to track expanded menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const visibleItems = SIDEBAR_NAVIGATION.filter((item) =>
    canAccessNavItem(user, item)
  );

  // Auto-expand menu if active path is a child of the menu
  useEffect(() => {
    visibleItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          location.pathname.startsWith(child.to)
        );
        if (hasActiveChild) {
          setExpandedMenus((prev) => ({
            ...prev,
            [item.label]: true,
          }));
        }
      }
    });
  }, [location.pathname, visibleItems]);

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

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              const isExpanded = !!expandedMenus[item.label];
              const hasActiveChild = item.children?.some((child) =>
                location.pathname.startsWith(child.to)
              );

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    className={[
                      "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition cursor-pointer text-left border-0 bg-transparent",
                      hasActiveChild
                        ? "bg-white/10 text-white font-semibold"
                        : "text-sky-100 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={[
                        "transition-transform duration-200",
                        isExpanded ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-11">
                      {item.children?.map((child) => {
                        const childVisible = canAccessNavItem(user, {
                          label: child.label,
                          to: child.to,
                          icon: item.icon,
                          roles: child.roles,
                          requiredPermission: child.requiredPermission,
                        });

                        if (!childVisible) return null;

                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                              [
                                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                                isActive
                                  ? "bg-white text-[#0B2E59] shadow-lg shadow-slate-950/20"
                                  : "text-sky-200 hover:bg-white/10 hover:text-white",
                              ].join(" ")
                            }
                          >
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
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
            );
          })}
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
