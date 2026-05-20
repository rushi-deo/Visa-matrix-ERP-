import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import DataTable, { type TableColumn } from "../../components/common/DataTable";
import ErrorState from "../../components/common/ErrorState";
import LoadingState from "../../components/common/LoadingState";
import SectionCard from "../../components/common/SectionCard";
import StatusPill from "../../components/common/StatusPill";
import { fetchAdminApplications } from "../../services/adminService";
import type { ApplicationListItem } from "../../types";
import { formatDate } from "../../utils/formatters";

const columns: TableColumn<ApplicationListItem>[] = [
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
    render: (row) => row.country || "Unknown",
  },
  {
    key: "visaType",
    header: "Visa Type",
    render: (row) => row.visa_type || "Not provided",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusPill value={row.status} />,
  },
  {
    key: "submissionDate",
    header: "Submission Date",
    render: (row) => formatDate(row.created_at),
  },
  {
    key: "agent",
    header: "Agent",
    render: (row) => row.agent || "Unassigned",
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <Link
        to={`/applications/${row.reference_no}`}
        className="font-semibold text-[#1E5BB8]"
      >
        Open case
      </Link>
    ),
  },
];

export default function ApplicationsBoard() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["applications-board"],
    queryFn: () => fetchAdminApplications(1, 25),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading applications..." />;
  }

  if (query.isError) {
    const message =
      query.error instanceof Error
        ? query.error.message
        : "Unable to load applications.";
    return <ErrorState description={message} />;
  }

  const rows = (query.data?.applications || []).filter((application) =>
    JSON.stringify(application).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SectionCard
      title="Application queue"
      description="Review visa application throughput, statuses, and ownership from the admin API."
      action={
        <Link
          to="/applications/create"
          className="rounded-2xl bg-[#1E5BB8] px-4 py-2 text-sm font-semibold text-white"
        >
          Create application
        </Link>
      }
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Queue insight
          </p>
          <p className="mt-3 text-base leading-7 text-slate-600">
            The current backend response provides client name, country, case status, payment state, and reference number. Additional assignee and visa-type columns are shown when available.
          </p>
        </div>
        <label className="block rounded-3xl bg-slate-50 p-5">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Search queue
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#1E5BB8]"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by applicant, reference, or country"
          />
        </label>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        emptyTitle="No applications found"
        emptyDescription="Applications returned from the backend will appear here."
      />
    </SectionCard>
  );
}
