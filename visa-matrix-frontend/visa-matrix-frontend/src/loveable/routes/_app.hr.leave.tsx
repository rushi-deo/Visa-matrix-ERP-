import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { employees } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/hr/leave")({ component: () => {
  const data = employees.slice(0,12).map((e, i) => ({
    id: e.id, employee: e.name, type: ["Sick","Casual","Earned","Unpaid"][i%4], from: "2025-11-1"+(i%9), to: "2025-11-1"+((i%9)+2),
    status: ["Pending","Approved","Pending","Rejected"][i%4],
  }));
  const cols: Column<typeof data[number]>[] = [
    { key: "employee", header: "Employee" }, { key: "type", header: "Leave Type" },
    { key: "from", header: "From" }, { key: "to", header: "To" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <ModulePage title="Leave Management" data={data} columns={cols} searchKeys={["employee"]} primaryAction="Apply Leave"
    rowAction={() => <div className="flex gap-1"><Button size="sm" variant="outline"><X className="size-3" /></Button><Button size="sm"><Check className="size-3" /></Button></div>} />;
}});
