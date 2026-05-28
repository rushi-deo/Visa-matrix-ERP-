import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { employees } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/settings/users")({ component: () => {
  const data = employees.slice(0,16).map((e, i) => ({ id: e.id, name: e.name, email: e.email, role: ["Super Admin","HR","Finance","CRM","Employee"][i%5], status: e.status, lastLogin: "2025-11-"+((i%27)+1).toString().padStart(2,"0") }));
  const cols: Column<typeof data[number]>[] = [
    { key: "name", header: "Name" }, { key: "email", header: "Email" }, { key: "role", header: "Role" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> }, { key: "lastLogin", header: "Last login" },
  ];
  return <ModulePage title="User Management" data={data} columns={cols} searchKeys={["name","email","role"]} primaryAction="Invite User" />;
}});
