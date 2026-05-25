import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  UserPlus,
  GitBranch,
  ClipboardList,
} from "lucide-react";

import LoadingState from "../components/common/LoadingState";
import { usePermissions } from "../hooks/usePermissions";
import * as employeeApi from "../services/employeeService";
import type { HrDashboardSummary } from "../types/employee";

export default function HR() {
  const { can, hasRole } = usePermissions();
  const canManage =
    hasRole(["Super Admin", "Admin", "HR Manager"]) || can("hr:view");

  const [summary, setSummary] = useState<HrDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    void employeeApi
      .fetchHrDashboard()
      .then(setSummary)
      .catch(() =>
        setSummary({
          totalEmployees: 0,
          activeEmployees: 0,
          newHires30d: 0,
          withReportingManager: 0,
          pendingReviews: 0,
        })
      )
      .finally(() => setLoading(false));
  }, [canManage]);

  if (loading) {
    return <LoadingState label="Loading HR dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Employee identity, organizational hierarchy, and workforce insights
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-4">
          <Briefcase className="h-8 w-8 text-[#1E5BB8]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={summary?.totalEmployees ?? "—"}
          icon={<Users className="h-5 w-5 text-[#1E5BB8]" />}
        />
        <StatCard
          label="Active Employees"
          value={summary?.activeEmployees ?? "—"}
          icon={<Users className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="New Hires (30d)"
          value={summary?.newHires30d ?? "—"}
          icon={<UserPlus className="h-5 w-5 text-indigo-600" />}
        />
        <StatCard
          label="With Manager"
          value={summary?.withReportingManager ?? "—"}
          icon={<GitBranch className="h-5 w-5 text-violet-600" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Employee Operations
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage profiles, reporting lines, departments, and employment status.
          </p>
          <Link
            to="/hr/employees"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1E5BB8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174B98]"
          >
            <Users size={18} />
            Open Employee Directory
          </Link>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Workflow Foundation
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Reporting hierarchy is stored on each profile and prepared in metadata
            for future approval chains.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <GitBranch size={16} className="text-[#1E5BB8]" />
              Manager-based approval routing (planned)
            </li>
            <li className="flex items-center gap-2">
              <ClipboardList size={16} className="text-[#1E5BB8]" />
              Leave & task escalation (planned)
            </li>
            <li className="flex items-center gap-2">
              <Briefcase size={16} className="text-[#1E5BB8]" />
              Department workflows (planned)
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
