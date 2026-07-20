import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiBriefcase,
  FiCheckSquare,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiGlobe,
  FiGrid,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";

const navigation = [
  { label: "Dashboard", to: "/", icon: FiGrid, end: true },
  { label: "Customers", to: "/customers", icon: FiUsers },
  { label: "Applications", to: "/applications", icon: FiClipboard },
  { label: "Countries", to: "/countries", icon: FiGlobe },
  { label: "Documents", to: "/documents", icon: FiFileText },
  { label: "Payments", to: "/payments", icon: FiCreditCard },
  { label: "Accounts", to: "/accounts", icon: FiBriefcase },
  { label: "Invoices", to: "/accounts/invoices", icon: FiBriefcase },
  { label: "Transactions", to: "/accounts/transactions", icon: FiBriefcase },
  { label: "Expenses", to: "/accounts/expenses", icon: FiBriefcase },
  { label: "Reports", to: "/accounts/reports", icon: FiBriefcase },
  { label: "Tasks", to: "/tasks", icon: FiCheckSquare },
  { label: "Admin", to: "/admin", icon: FiSettings },
];

const navLinkClassName = ({ isActive }) =>
  [
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
    isActive
      ? "bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/30"
      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
  ].join(" ");

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950/95 px-6 py-6 shadow-2xl shadow-slate-950/40 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="section-label">Visa Matrix ERP</div>
            <h1 className="mt-2 text-2xl font-bold text-white">
              Command Center
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Monitoring, CRM, and case execution in one control surface.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-800 p-2 text-slate-400 transition hover:border-slate-700 hover:text-slate-100 lg:hidden"
            onClick={onClose}
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            System Mesh
          </div>
          <p className="mt-3 text-sm text-slate-200">
            6 intake queues synced, 3 automations active, 1 escalated review.
          </p>
        </div>

        <nav className="mt-8 flex-1 space-y-2 overflow-y-auto thin-scrollbar">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                className={navLinkClassName}
                end={item.end}
                to={item.to}
                onClick={onClose}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-base transition group-hover:border-slate-700">
                  <Icon />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-sm font-semibold text-white">
            Operations Note
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Keep fallback mode enabled during demos. Protected endpoints will
            still hydrate when an auth token is present.
          </p>
        </div>
      </aside>
    </>
  );
}
