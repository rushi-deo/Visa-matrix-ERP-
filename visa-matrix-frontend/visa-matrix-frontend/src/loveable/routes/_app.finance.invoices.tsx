import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { invoices, type Invoice } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/finance/invoices")({ component: () => {
  const navigate = useNavigate();
  const cols: Column<Invoice>[] = [
    { key: "invoiceNo", header: "Invoice #", sortable: true }, { key: "customer", header: "Customer" },
    { key: "issued", header: "Issued" }, { key: "due", header: "Due" },
    { key: "amount", header: "Amount", render: (r) => `$${r.amount.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <ModulePage title="Invoices" description="All client invoices and billing." data={invoices} columns={cols} searchKeys={["invoiceNo","customer"]} primaryAction="Create Invoice"
    onRowClick={(row) => navigate({ to: "/finance/invoices/$id", params: { id: row.id } })}
    rowAction={() => <Button size="icon" variant="ghost"><Download className="size-4" /></Button>} />;
}});
