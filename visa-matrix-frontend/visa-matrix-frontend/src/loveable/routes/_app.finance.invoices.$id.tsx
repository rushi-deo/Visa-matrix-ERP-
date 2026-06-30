import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Download,
  Printer,
  Mail,
  Calendar,
  CircleDollarSign,
  User,
  FileText,
  BadgeCheck,
} from "lucide-react";
import apiClient from "../../services/apiClient";

export const Route = createFileRoute("/_app/finance/invoices/$id")({
  component: InvoiceDetailRoute,
});

function InvoiceDetailRoute() {
  const { id } = Route.useParams();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const response = await apiClient.get(`/invoices/${id}`);

        const invoiceData =
          response?.data?.data ??
          response?.data ??
          null;

        setInvoice(invoiceData);
      } catch (error) {
        console.error("Failed to load invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Header */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                  Invoice
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {invoice.invoice_number || invoice.invoice_code || "Invoice"}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {invoice.customer_name || invoice.customer_initials || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    Created {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:items-end">
              <div className="text-left xl:text-right">
                <p className="text-sm font-medium text-gray-500">Amount Due</p>
                <div className="mt-2 flex items-center gap-3 xl:justify-end">
                  <CircleDollarSign className="text-blue-600" size={28} />
                  <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    ₹{Number(invoice.amount || invoice.total_amount || invoice.subtotal || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {invoice.status || "Unpaid"}
              </span>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800">
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50">
                  <Mail size={16} />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Summary KPI Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Amount Due</p>
                <div className="mt-3 text-3xl font-semibold tracking-tight">₹{Number(invoice.amount || invoice.total_amount || invoice.subtotal || 0).toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <CircleDollarSign size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Invoice Status</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {invoice.status || "Unpaid"}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 text-gray-500">
                <BadgeCheck size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Due Date</p>
                <div className="mt-3 text-lg font-semibold text-gray-900">
                  {invoice.due_date || "-"}
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 text-gray-500">
                <Calendar size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Invoice Number</p>
                <div className="mt-3 text-lg font-semibold text-gray-900">
                  {invoice.invoice_number || invoice.invoice_code || invoice.quotation_number || "-"}
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 text-gray-500">
                <FileText size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Customer Information */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Customer Name</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">{invoice.customer_name || invoice.customer_initials || invoice.customer || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Email</p>
                  <p className="mt-2 text-base text-gray-900">{invoice.customer_email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Phone</p>
                  <p className="mt-2 text-base text-gray-900">{invoice.customer_phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Country</p>
                  <p className="mt-2 text-base text-gray-900">{invoice.country || "-"}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Invoice Number</p>
                  <p className="mt-2 text-base font-bold text-gray-900">{invoice.invoice_number || invoice.invoice_code || invoice.quotation_number || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Issue Date</p>
                  <p className="mt-2 text-base font-bold text-gray-900">{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Due Date</p>
                  <p className="mt-2 text-base font-bold text-gray-900">{invoice.due_date || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Status</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {invoice.status || "Unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              </div>
              <div className="p-6 text-sm leading-7 text-gray-700">
                {invoice.notes || "No notes available"}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-gray-500">Amount</span>
                  <span className="text-base font-semibold text-gray-900">₹{Number(invoice.amount || invoice.total_amount || invoice.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-gray-500">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {invoice.status || "Unpaid"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm uppercase tracking-[0.2em] text-gray-500">Due Date</span>
                  <span className="text-base font-semibold text-gray-900">{invoice.due_date || "-"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="space-y-3 p-6">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800">
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  <Printer size={16} />
                  Print Invoice
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50">
                  <Mail size={16} />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
