import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { leads } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/crm/customers")({ component: () => {
  const data = leads.filter((l) => l.stage === "Won");
  const cols: Column<typeof data[number]>[] = [
    { key: "name", header: "Customer" }, { key: "email", header: "Email" }, { key: "phone", header: "Phone" },
    { key: "country", header: "Country" }, { key: "value", header: "LTV", render: (r) => `$${r.value.toLocaleString()}` },
    { key: "stage", header: "Status", render: (r) => <StatusBadge value={r.stage} /> },
  ];
  return <ModulePage title="Customers" data={data} columns={cols} searchKeys={["name","email","country"]} primaryAction="Add Customer" />;
}});
