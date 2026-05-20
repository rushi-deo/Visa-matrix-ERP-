import { useEffect, useState } from "react";
import Table from "../components/Table";
import { formatCurrency, getPayments } from "../services/api";

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("paid")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("pending")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
};

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Payments({ searchQuery }) {
  const [payments, setPayments] = useState([]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadPayments = async () => {
      const result = await getPayments();

      if (active) {
        setPayments(result.items);
        setSource(result.source);
      }
    };

    loadPayments();

    return () => {
      active = false;
    };
  }, []);

  const filteredPayments = payments.filter((item) => matchesSearch(item, searchQuery));
  const totalBilled = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCollected = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = totalBilled - totalCollected;

  const columns = [
    { key: "customer", label: "Customer" },
    { key: "application", label: "Application" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => (
        <div>
          <div className="font-semibold text-white">
            {formatCurrency(row.amount, row.currency)}
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {row.invoice}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-pill border ${statusClassName(row.status)}`}>{row.status}</span>
      ),
    },
    { key: "date", label: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Payments Module</div>
          <h2 className="page-title mt-2">Invoices and payment status</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Follow invoice status, collected revenue, and failed payment retries across
            active applications.
          </p>
        </div>
        <div
          className={[
            "status-pill border",
            source === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300",
          ].join(" ")}
        >
          {source === "live" ? "Live payment feed" : "Fallback payment feed"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <div className="card-panel">
            <p className="text-sm text-slate-400">Total Invoiced</p>
            <p className="mt-3 text-3xl font-bold text-white">{formatCurrency(totalBilled)}</p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="card-panel">
            <p className="text-sm text-slate-400">Collected</p>
            <p className="mt-3 text-3xl font-bold text-emerald-300">
              {formatCurrency(totalCollected)}
            </p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="card-panel">
            <p className="text-sm text-slate-400">Outstanding</p>
            <p className="mt-3 text-3xl font-bold text-amber-300">
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>
      </div>

      <Table
        title="Payment Ledger"
        subtitle="Invoices and payment status for visa applications."
        columns={columns}
        rows={filteredPayments}
      />
    </div>
  );
}
