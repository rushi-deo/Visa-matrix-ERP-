import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";

type Leave = { id: string; employee: string; type: string; from: string; to: string; status: string };

export const Route = createFileRoute("/_app/hr/leave")({
  component: Page,
});

function Page() {
  const [data, setData] = useState<Leave[]>([]);

  useEffect(() => {
    let mounted = true;
    hrWorkspaceApi.getEmployees().then((response) => {
      if (!mounted) return;
      const items = Array.isArray(response?.items) ? response.items : [];
      setData(items.slice(0, 12).map((e: any, i: number) => ({
        id: e.id,
        employee: e.name,
        type: ["Sick", "Casual", "Earned", "Unpaid"][i % 4],
        from: `2025-11-${String(10 + (i % 9)).padStart(2, "0")}`,
        to: `2025-11-${String(12 + (i % 9)).padStart(2, "0")}`,
        status: ["Pending", "Approved", "Pending", "Rejected"][i % 4],
      })));
    }).catch(() => mounted && setData([]));
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<Leave>[] = [
    { key: "employee", header: "Employee" },
    { key: "type", header: "Leave Type" },
    { key: "from", header: "From" },
    { key: "to", header: "To" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ModulePage
      title="Leave Management"
      data={data}
      columns={cols}
      searchKeys={["employee"]}
      primaryAction="Apply Leave"
      rowAction={() => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline"><X className="size-3" /></Button>
          <Button size="sm"><Check className="size-3" /></Button>
        </div>
      )}
    />
  );
}
