import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
import { fetchPayments } from "@erp/services/payments.service";

type Payment = {
  id: string;
  invoiceNo: string;
  customer: string;
  amount: number;
  issued: string;
  status: string;
};

export const Route = createFileRoute("/_app/finance/payments")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchPayments()
      .then((rows) => {
        if (mounted) setPayments(rows.filter((payment) => payment.status !== "Pending") as Payment[]);
      })
      .catch(() => {
        if (mounted) setPayments([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<Payment>[] = [
    { key: "invoiceNo", header: "Invoice" },
    { key: "customer", header: "Customer" },
    { key: "amount", header: "Amount", render: (r) => `$${r.amount.toLocaleString()}` },
    { key: "issued", header: "Date" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ModulePage
      title="Payments"
      data={payments}
      columns={cols}
      searchKeys={["invoiceNo", "customer"]}
      primaryAction="Record Payment"
      onRowClick={(row) =>
        navigate({
          to: "/finance/payments/$id",
          params: { id: row.id },
        })
      }
    />
  );
}
