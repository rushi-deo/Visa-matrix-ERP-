import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { leads, type Lead } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/crm/leads")({ component: () => {
  const navigate = useNavigate();
  const cols: Column<Lead>[] = [
    { key: "name", header: "Name", sortable: true }, { key: "email", header: "Email" },
    { key: "source", header: "Source" }, { key: "country", header: "Country" },
    { key: "stage", header: "Stage", render: (r) => <StatusBadge value={r.stage} /> },
    { key: "owner", header: "Owner" }, { key: "value", header: "Value", sortable: true, accessor: (r) => r.value, render: (r) => `$${r.value.toLocaleString()}` },
  ];
  return <ModulePage title="Leads" description="All inbound and outbound leads." data={leads} columns={cols} searchKeys={["name","email","owner","country"]} primaryAction="Add Lead" onRowClick={(row) => navigate({ to: "/crm/leads/$id", params: { id: row.id } })} />;
}});
