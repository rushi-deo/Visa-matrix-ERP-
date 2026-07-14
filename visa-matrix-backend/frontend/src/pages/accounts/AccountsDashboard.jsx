import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  ReceiptText,
  Wallet,
} from "lucide-react";

import SectionCard from "../../components/common/SectionCard";
import DataTable from "../../components/common/DataTable";
import {
  accountsSummary,
  getAccountsStatusTone,
  mockAccountsTransactions,
} from "../../services/accountsService";
import { formatAccountCurrency } from "../../services/accountsService";
import { formatDate } from "../../utils/formatters";

const statusMappings = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-rose-100 text-rose-700",
  Refunded: "bg-violet-100 text-violet-700",
};

const kpiCards = [
  {
    label: "Total Revenue",
    value: accountsSummary.totalRevenue,
    delta: "+12.4% vs last month",
    icon: Landmark,
    tone: "from-sky-500 to-blue-700",
  },
  {
    label: "Pending Payments",
    value: accountsSummary.pendingPayments,
    delta: "-3.1% from previous cycle",
    icon: Wallet,
    tone: "from-amber-400 to-orange-500",
  },
  {
    label: "Monthly Collection",
    value: accountsSummary.monthlyCollection,
    delta: "+8.6% collection efficiency",
    icon: CreditCard,
    tone: "from-emerald-500 to-teal-600",
  },
  {
    label: "Refund Requests",
    value: accountsSummary.refundRequests,
    delta: "2 new approvals pending",
    icon: ReceiptText,
    tone: "from-violet-500 to-fuchsia-600",
  },
];

function FinanceMetricCard({ label, value, delta, icon: Icon, tone }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {formatAccountCurrency(value)}
          </p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${tone} p-3 text-white`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600">
          <ArrowUpRight size={14} />
          {delta}
        </span>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusMappings[status] || getAccountsStatusTone(status)
      }`}
    >
      {status}
    </span>
  );
}

export default function AccountsDashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const transactions = useMemo(() => {
    const filtered = mockAccountsTransactions.filter((transaction) => {
      const haystack =
        `${transaction.id} ${transaction.customer} ${transaction.applicationId} ${transaction.paymentType}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "amount") {
        return b.amount - a.amount;
      }

      if (sortBy === "customer") {
        return a.customer.localeCompare(b.customer);
      }

      return b.date.localeCompare(a.date);
    });
  }, [search, sortBy]);

  const columns = [
    {
      key: "id",
      header: "Transaction ID",
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer Name",
      render: (row) => row.customer,
    },
    {
      key: "applicationId",
      header: "Application ID",
      render: (row) => row.applicationId,
    },
    {
      key: "paymentType",
      header: "Payment Type",
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
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.date),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E5BB8]">
          Accounts Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Financial operations, collections, invoices, and business revenue
          overview.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Monitor collections, invoice status, and cash flow health across every
          active visa application.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <FinanceMetricCard key={card.label} {...card} />
        ))}
      </div>

      <SectionCard
        title="Recent transactions"
        description="A real-time view of collection activity, refunds, and payment settlement health."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Search
              <input
                className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
                placeholder="Search transactions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Sort by
              <select
                className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="date">Latest</option>
                <option value="amount">Highest amount</option>
                <option value="customer">Customer</option>
              </select>
            </label>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={transactions}
          emptyTitle="No transactions found"
          emptyDescription="Try adjusting the search term or sorting option."
        />
      </SectionCard>
    </div>
  );
}
