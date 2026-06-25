import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      {/* Header */}
<div className="flex justify-between items-start mb-8 border-b pb-6">
  <div>
    <h1 className="text-3xl font-bold">
      {invoice.invoice_number ||
        invoice.invoice_code ||
        "Invoice"}
    </h1>

    <div className="flex gap-4 mt-2 text-sm text-gray-500">
      <span>
        Created:
        {" "}
        {invoice.created_at
          ? new Date(
              invoice.created_at
            ).toLocaleDateString()
          : "-"}
      </span>

      <span>
        Status:
        {" "}
        <span className="font-medium capitalize">
          {invoice.status || "unpaid"}
        </span>
      </span>
    </div>
  </div>

  <div className="flex gap-2">
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Print
    </button>

    <button
      className="px-4 py-2 border rounded"
    >
      Download PDF
    </button>

    <button
      className="px-4 py-2 border rounded"
    >
      Send Email
    </button>
  </div>
</div>
{/* Summary Cards */}
<div className="grid gap-4 md:grid-cols-3 mb-8">
  <div className="border rounded-lg p-5 bg-white shadow-sm">
    <p className="text-sm text-gray-500">Amount</p>
    <h2 className="text-2xl font-bold mt-2">
      ₹
      {Number(
        invoice.amount ||
          invoice.total_amount ||
          invoice.subtotal ||
          0
      ).toLocaleString()}
    </h2>
  </div>

  <div className="border rounded-lg p-5 bg-white shadow-sm">
    <p className="text-sm text-gray-500">Customer</p>
    <h2 className="text-2xl font-bold mt-2">
      {invoice.customer_initials ||
        invoice.customer_name ||
        invoice.customer ||
        "-"}
    </h2>
  </div>

  <div className="border rounded-lg p-5 bg-white shadow-sm">
    <p className="text-sm text-gray-500">Status</p>
    <div className="mt-3">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          invoice.status === "paid"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {invoice.status || "unpaid"}
      </span>
    </div>
  </div>
</div>
      {/* Details */}
      {/* Information Cards */}
<div className="grid gap-6 md:grid-cols-2">

  {/* Customer Card */}
  <div className="border rounded-lg p-6 bg-white shadow-sm">
    <h2 className="text-lg font-semibold mb-4">
      Customer Information
    </h2>

    <div className="space-y-3">
      <p>
        <span className="text-gray-500">Customer</span>
        <br />
        <span className="font-medium">
          {invoice.customer_name ||
            invoice.customer_initials ||
            invoice.customer ||
            "-"}
        </span>
      </p>
    </div>
  </div>

  {/* Invoice Card */}
  <div className="border rounded-lg p-6 bg-white shadow-sm">
    <h2 className="text-lg font-semibold mb-4">
      Invoice Information
    </h2>

    <div className="space-y-3">

      <p>
        <span className="text-gray-500">
          Invoice Number
        </span>
        <br />
        <span className="font-medium">
          {invoice.invoice_number ||
            invoice.invoice_code ||
            invoice.quotation_number ||
            "-"}
        </span>
      </p>

      <p>
        <span className="text-gray-500">
          Invoice Date
        </span>
        <br />
        <span className="font-medium">
          {invoice.created_at
            ? new Date(
                invoice.created_at
              ).toLocaleDateString()
            : "-"}
        </span>
      </p>

      <p>
        <span className="text-gray-500">
          Due Date
        </span>
        <br />
        <span className="font-medium">
          {invoice.due_date || "-"}
        </span>
      </p>

      <p>
        <span className="text-gray-500">
          Status
        </span>
        <br />
        <span className="font-medium capitalize">
          {invoice.status || "unpaid"}
        </span>
      </p>

    </div>
  </div>

</div>

      {/* Notes */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">
          Notes
        </h2>

        <div className="border rounded p-4">
          {invoice.notes || "No notes available"}
        </div>
      </div>
    </div>
  );
}