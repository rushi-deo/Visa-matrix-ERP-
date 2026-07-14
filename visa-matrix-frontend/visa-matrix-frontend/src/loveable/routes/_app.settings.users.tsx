import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";

type User = { id: string; name: string; email: string; role: string; status?: string; lastLogin: string };

export const Route = createFileRoute("/_app/settings/users")({
  component: Page,
});

function Page() {
  const [data, setData] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    hrWorkspaceApi.getEmployees().then((response) => {
      if (!mounted) return;
      const items = Array.isArray(response?.items) ? response.items : [];
      setData(items.slice(0, 16).map((e: any, i: number) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        role: ["Super Admin", "HR", "Finance", "CRM", "Employee"][i % 5],
        status: e.status,
        lastLogin: `2025-11-${String((i % 27) + 1).padStart(2, "0")}`,
      })));
    }).catch(() => mounted && setData([]));
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<User>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status ?? ""} /> },
    { key: "lastLogin", header: "Last login" },
  ];

  return <ModulePage title="User Management" data={data} columns={cols} searchKeys={["name", "email", "role"]} primaryAction="Invite User" />;
}
