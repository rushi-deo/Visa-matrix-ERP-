import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { applications, type Application } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/visa/approvals")({ component: () => {
  const data = applications.filter((a) => a.status === "Under Review" || a.status === "Submitted");
  const cols: Column<Application>[] = [
    { key: "appId", header: "App ID" }, { key: "applicant", header: "Applicant" },
    { key: "country", header: "Country", render: (r) => `${r.flag} ${r.country}` },
    { key: "priority", header: "Priority", render: (r) => <StatusBadge value={r.priority} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <ModulePage title="Approval Center" description="Pending applications awaiting your review."
    data={data} columns={cols} searchKeys={["applicant","appId","country"]}
    rowAction={() => (<div className="flex gap-1"><Button size="sm" variant="outline"><X className="size-3" /></Button><Button size="sm"><Check className="size-3" /></Button></div>)} />;
}});
