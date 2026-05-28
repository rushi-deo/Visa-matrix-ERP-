import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { applications, type Application } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/visa/applications")({ component: Page });
function Page() {
  const navigate = useNavigate();
  const cols: Column<Application>[] = [
    { key: "appId", header: "App ID", sortable: true, render: (r) => <span className="font-medium">{r.appId}</span> },
    { key: "applicant", header: "Applicant", sortable: true },
    { key: "country", header: "Country", render: (r) => <span className="inline-flex items-center gap-1.5"><span>{r.flag}</span>{r.country}</span> },
    { key: "visaType", header: "Visa Type" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "priority", header: "Priority", render: (r) => <StatusBadge value={r.priority} /> },
    { key: "assignee", header: "Assignee" },
    { key: "amount", header: "Amount", sortable: true, accessor: (r) => r.amount, render: (r) => `$${r.amount.toLocaleString()}` },
  ];
  return <ModulePage title="Visa Applications" description="Track and manage every visa case across countries."
    data={applications} columns={cols} searchKeys={["applicant","appId","country","visaType","assignee"]}
    primaryAction="New Application"
    rowAction={(r) => <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/visa/applications/$id", params: { id: r.id } })}><Eye className="size-4" /></Button>} />;
}
