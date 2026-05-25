import { useMemo, useState } from "react";
import { Download, Eye, HandCoins } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import {
  createInvoicePdfContent,
  mockAccountsInvoices,
  formatAccountCurrency,
} from "../../services/accountsService";
import { formatDate } from "../../utils/formatters";

const paymentStatusStyles = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-rose-100 text-rose-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceRows, setInvoiceRows] = useState(mockAccountsInvoices);

  const filteredInvoices = useMemo(() => {
    return invoiceRows.filter((invoice) => {
      const haystack =
        `${invoice.invoiceNumber} ${invoice.customer} ${invoice.visaType} ${invoice.applicationId}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || invoice.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoiceRows, search, statusFilter]);

  const paginatedInvoices = filteredInvoices.slice((page - 1) * 5, page * 5);

  const handleMarkPaid = (invoiceNumber) => {
    setInvoiceRows((current) =>
      current.map((invoice) =>
        invoice.invoiceNumber === invoiceNumber
          ? { ...invoice, paymentStatus: "Paid" }
          : invoice,
      ),
    );
  };

  const handleDownload = (invoice) => {
    const blob = new Blob([createInvoicePdfContent(invoice)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice Number",
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => row.customer,
    },
    {
      key: "visaType",
      header: "Visa Type",
      render: (row) => row.visaType,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatAccountCurrency(row.amount),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (row) => <StatusBadge status={row.paymentStatus} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E5BB8]">
          Invoice Management
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Create, review, and manage billing operations for active visa cases.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Search invoices, filter by payment status, and keep collections moving
          with quick actions.
        </p>
      </div>

      <SectionCard
        title="Invoice list"
        description="Professional invoice controls with search, filtering, and pagination."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
              placeholder="Search invoice"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={paginatedInvoices}
          emptyTitle="No invoices found"
          emptyDescription="Try changing the search term or payment status filter."
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {paginatedInvoices.length} of {filteredInvoices.length}{" "}
            invoices
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-2xl bg-[#0B2E59] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {paginatedInvoices.map((invoice) => (
            <div
              key={invoice.invoiceNumber}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-slate-500">{invoice.customer}</p>
                </div>
                <StatusBadge status={invoice.paymentStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <Eye size={16} />
                  View Invoice
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#1E5BB8] px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => handleDownload(invoice)}
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                  onClick={() => handleMarkPaid(invoice.invoiceNumber)}
                >
                  <HandCoins size={16} />
                  Mark as Paid
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedInvoice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_25px_60px_rgba(11,46,89,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E5BB8]">
                  Invoice preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedInvoice.invoiceNumber}
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedInvoice.customer}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Visa Type</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedInvoice.visaType}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatAccountCurrency(selectedInvoice.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">GST</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatAccountCurrency(selectedInvoice.gst)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Due Date</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(selectedInvoice.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Application</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedInvoice.applicationId}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
