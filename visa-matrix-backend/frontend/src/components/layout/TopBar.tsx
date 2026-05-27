import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { APP_NAME, SIDEBAR_NAVIGATION } from "../../config/appConfig";
import { useAuth } from "../../hooks/useAuth";
import { toTitleCase } from "../../utils/formatters";

type TopBarProps = {
  onOpenSidebar: () => void;
};

export default function TopBar({ onOpenSidebar }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const matchedNavItem = SIDEBAR_NAVIGATION.find((item) =>
    location.pathname.startsWith(item.to)
  );

  const title =
    matchedNavItem?.label ||
    toTitleCase(location.pathname.replaceAll("/", " ")) ||
    APP_NAME;

  return (
    <header className="sticky top-0 z-20 border-b border-premium-silver-200/50 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className={[
              "rounded-premium border border-premium-silver-200 bg-white p-3",
              "text-premium-navy-700 shadow-sm transition-all duration-300",
              "hover:bg-premium-platinum-100 hover:shadow-card-hover",
              "focus:ring-premium md:hidden",
            ].join(" ")}
            onClick={onOpenSidebar}
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-premium-silver-400">
              Workspace
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-premium-navy-950">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search Bar */}
          <div className="hidden min-w-[280px] items-center gap-3 rounded-premium border border-premium-silver-200 bg-premium-platinum-100 px-4 py-3 transition-all duration-300 hover:border-premium-blue-300/50 hover:bg-white hover:shadow-sm focus-within:ring-premium lg:flex">
            <Search size={16} className="text-premium-silver-400" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-premium-silver-400"
              placeholder="Search applications, customers, messages..."
            />
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className={[
              "rounded-premium border border-premium-silver-200 bg-white p-3",
              "text-premium-navy-700 shadow-sm transition-all duration-300",
              "hover:bg-premium-platinum-100 hover:shadow-card",
              "focus:ring-premium relative",
              "before:absolute before:-top-1 before:-right-1 before:h-2 before:w-2 before:rounded-full before:bg-premium-emerald before:opacity-0 hover:before:opacity-100",
            ].join(" ")}
          >
            <Bell size={18} />
          </button>

          {/* User Info */}
          <div className="hidden rounded-premium border border-premium-silver-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-card sm:block">
            <p className="text-sm font-semibold text-premium-navy-950">{user?.name}</p>
            <p className="text-xs uppercase tracking-widest text-premium-silver-400">
              {user?.rawRole || user?.role}
            </p>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className={[
              "rounded-premium border border-premium-silver-200 bg-white p-3",
              "text-premium-navy-700 shadow-sm transition-all duration-300",
              "hover:bg-premium-platinum-100 hover:shadow-card hover:text-premium-rose",
              "focus:ring-premium active:scale-95",
            ].join(" ")}
            onClick={() => void handleLogout()}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
