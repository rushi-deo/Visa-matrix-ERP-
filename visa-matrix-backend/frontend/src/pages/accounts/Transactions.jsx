import { useMemo, useState } from "react";
import { CalendarRange, Filter } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import {
  accountsTimeline,
  formatAccountCurrency,
  mockAccountsTransactions,
} from "../../services/accountsService";
import { formatDate } from "../../utils/formatters";

const statusStyles = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-rose-100 text-rose-700",
  Refunded: "bg-violet-100 text-violet-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("30");

  const filteredTransactions = useMemo(() => {
    const now = new Date("2026-05-25");
    return mockAccountsTransactions.filter((transaction) => {
      const haystack =
        `${transaction.id} ${transaction.customer} ${transaction.applicationId} ${transaction.paymentType}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;
      const transactionDate = new Date(transaction.date);
      const daysDiff = Math.round(
        (now - transactionDate) / (1000 * 60 * 60 * 24),
      );
      const matchesRange = dateRange === "All" || daysDiff <= Number(dateRange);
      return matchesSearch && matchesStatus && matchesRange;
    });
  }, [search, statusFilter, dateRange]);

  const columns = [
    { key: "id", header: "Transaction ID", render: (row) => row.id },
    { key: "customer", header: "Customer", render: (row) => row.customer },
    {
      key: "applicationId",
      header: "Application ID",
      render: (row) => row.applicationId,
    },
    {
      key: "paymentType",
      header: "Payment Mode",
      render: (row) => row.paymentType,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatAccountCurrency(row.amount),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E5BB8]">
          Payment history
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Full payment history, mode tracking, and finance activity timeline.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Filter by payment mode, status, and date range to pinpoint collections
          and reconciliation gaps.
        </p>
      </div>

      <SectionCard
        title="Transaction controls"
        description="Filter the ledger and review the latest payment activity."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <Filter size={16} />
              <input
                className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
                placeholder="Search transactions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Status
              <select
                className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarRange size={16} />
              Date range
              <select
                className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
              >
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="All">All time</option>
              </select>
            </label>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={filteredTransactions}
          emptyTitle="No transactions match your filters"
          emptyDescription="Try broadening the search or removing status restrictions."
        />
      </SectionCard>

      <SectionCard
        title="Transaction timeline"
        description="A contextual view of finance events that impact payment reconciliation."
      >
        <div className="space-y-3">
          {accountsTimeline.map((item) => (
            <div
              key={item.time}
              className="flex flex-col gap-2 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
              <span className="text-sm font-semibold text-[#1E5BB8]">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
