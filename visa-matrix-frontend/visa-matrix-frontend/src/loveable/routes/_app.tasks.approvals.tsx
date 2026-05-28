import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/tasks/approvals")({ component: () => {
  const data = Array.from({length: 10}).map((_, i) => ({ id: "ap"+i, ref: "APR-"+(2000+i), type: ["Leave","Refund","Expense","Discount"][i%4], requester: ["Priya Sharma","Rohan Verma","Meera Kumar","Arjun Mehta"][i%4], date: "2025-11-"+((i%27)+1).toString().padStart(2,"0") }));
  const cols: Column<typeof data[number]>[] = [
    { key: "ref", header: "Reference" }, { key: "type", header: "Type" }, { key: "requester", header: "Requester" }, { key: "date", header: "Submitted" },
  ];
  return <ModulePage title="Pending Approvals" data={data} columns={cols} searchKeys={["ref","requester"]} primaryAction="New Request"
    rowAction={() => <div className="flex gap-1"><Button size="sm" variant="outline"><X className="size-3" /></Button><Button size="sm"><Check className="size-3" /></Button></div>} />;
}});
