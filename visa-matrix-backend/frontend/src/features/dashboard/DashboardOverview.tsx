import {
  BadgeCheck,
  CircleX,
  FileClock,
  Files,
  Wallet,
  Workflow,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import ActivityFeed from "../../components/dashboard/ActivityFeed";
import TrendCharts from "../../components/dashboard/TrendCharts";
import WorldMapCard from "../../components/dashboard/WorldMapCard";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import ErrorState from "../../components/common/ErrorState";
import LoadingState from "../../components/common/LoadingState";
import SectionCard from "../../components/common/SectionCard";
import StatCard from "../../components/common/StatCard";
import StatusPill from "../../components/common/StatusPill";
import { fetchAdminApplications, fetchDashboardSummary } from "../../services/adminService";
import type { ApplicationListItem } from "../../types";
import { formatDate } from "../../utils/formatters";
import { buildActivityFeed, summarizeDashboard } from "../../utils/normalizers";

const applicationColumns: TableColumn<ApplicationListItem>[] = [
  {
    key: "applicant",
    header: "Applicant Name",
    render: (row) => (
      <div>
        <p className="font-semibold text-slate-900">{row.client_name}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {row.reference_no}
        </p>
      </div>
    ),
  },
  {
    key: "country",
    header: "Country",
    render: (row) => row.country || "Pending assignment",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusPill value={row.status} />,
  },
  {
    key: "submission",
    header: "Submission Date",
    render: (row) => formatDate(row.created_at),
  },
  {
    key: "action",
    header: "Actions",
    render: (row) => (
      <Link
        to={`/applications/${row.reference_no}`}
        className="font-semibold text-[#1E5BB8]"
      >
        View case
      </Link>
    ),
  },
];

export default function DashboardOverview() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  const applicationsQuery = useQuery({
    queryKey: ["dashboard-applications"],
    queryFn: () => fetchAdminApplications(1, 10),
  });

  if (summaryQuery.isLoading || applicationsQuery.isLoading) {
    return <LoadingState label="Loading dashboard telemetry..." />;
  }

  if (summaryQuery.isError || applicationsQuery.isError) {
    const message =
      (summaryQuery.error as Error | undefined)?.message ||
      (applicationsQuery.error as Error | undefined)?.message ||
      "The dashboard APIs are unavailable.";

    return <ErrorState description={message} />;
  }

  const summary = summarizeDashboard(summaryQuery.data);
  const applications = applicationsQuery.data?.applications || [];
  const activityItems = buildActivityFeed(applications);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Total applications"
          value={summary.total_applications}
          delta="Live backend count"
          icon={Files}
        />
        <StatCard
          label="Applications today"
          value={summary.applications_today}
          delta="New intake volume"
          icon={Workflow}
        />
        <StatCard
          label="Pending documents"
          value={summary.pending_documents}
          delta="Needs client follow-up"
          icon={FileClock}
        />
        <StatCard
          label="Payments pending"
          value={summary.payments_pending}
          delta="Collections outstanding"
          icon={Wallet}
        />
        <StatCard
          label="Visas approved"
          value={summary.visas_approved}
          delta="Positive case decisions"
          icon={BadgeCheck}
        />
        <StatCard
          label="Visas rejected"
          value={summary.visas_rejected}
          delta="Monitor decline reasons"
          icon={CircleX}
        />
      </section>

      <TrendCharts applications={applications} />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Recent applications"
          description="Operational queue from the protected admin application endpoint."
          action={
            <Link
              to="/applications"
              className="rounded-2xl bg-[#1E5BB8] px-4 py-2 text-sm font-semibold text-white"
            >
              Open queue
            </Link>
          }
        >
          <DataTable
            columns={applicationColumns}
            rows={applications}
            emptyTitle="No applications found"
            emptyDescription="Once the backend returns application records, they will appear in this queue."
          />
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Feed of the latest application events visible from the current admin dataset."
        >
          <ActivityFeed items={activityItems} />
        </SectionCard>
      </div>

      <WorldMapCard applications={applications} />
    </div>
  );
}
