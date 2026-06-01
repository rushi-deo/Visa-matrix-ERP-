import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { invoices } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/finance/payments")({ component: () => {
  const navigate = useNavigate();
  const data = invoices.filter((i) => i.status !== "Pending");
  const cols: Column<typeof data[number]>[] = [
    { key: "invoiceNo", header: "Invoice" }, { key: "customer", header: "Customer" },
    { key: "amount", header: "Amount", render: (r) => `$${r.amount.toLocaleString()}` },
    { key: "issued", header: "Date" }, { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <ModulePage title="Payments" data={data} columns={cols} searchKeys={["invoiceNo","customer"]} primaryAction="Record Payment" onRowClick={(row) => navigate({ to: "/finance/payments/$id", params: { id: row.id } })} />;
}});
