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
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm md:hidden"
          onClick={onOpenSidebar}
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden min-w-[260px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex">
          <Search size={16} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Search applications, customers, messages..."
          />
        </div>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm"
        >
          <Bell size={18} />
        </button>
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm sm:block">
          <p className="text-sm font-semibold text-slate-950">{user?.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {user?.rawRole || user?.role}
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm"
          onClick={() => void handleLogout()}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
