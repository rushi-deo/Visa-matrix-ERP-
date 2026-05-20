import { FiActivity, FiBell, FiMenu, FiSearch } from "react-icons/fi";

export default function Topbar({
  searchQuery,
  onSearchChange,
  onMenuToggle,
  systemStatus,
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl lg:left-72">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-800 p-2 text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 lg:hidden"
            onClick={onMenuToggle}
          >
            <FiMenu className="text-lg" />
          </button>
          <label className="relative block w-full max-w-2xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/80 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Search applications, customers, countries, invoices..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={[
              "status-pill border",
              systemStatus.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300",
            ].join(" ")}
            title={systemStatus.detail}
          >
            <FiActivity />
            <span>{systemStatus.label}</span>
          </div>

          <button
            type="button"
            className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <FiBell className="text-lg" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-blue-400" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 py-1 pl-1 pr-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">
              VM
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-white">Ops Director</div>
              <div className="text-xs text-slate-400">visa.matrix.local</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
