import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { tasks } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/crm/tasks")({ component: () => {
  const cols: Column<typeof tasks[number]>[] = [
    { key: "title", header: "Task" }, { key: "assignee", header: "Assignee" }, { key: "due", header: "Due" },
    { key: "priority", header: "Priority", render: (r) => <StatusBadge value={r.priority} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <ModulePage title="Follow-ups & Tasks" data={tasks} columns={cols} searchKeys={["title","assignee"]} primaryAction="New Task" />;
}});
