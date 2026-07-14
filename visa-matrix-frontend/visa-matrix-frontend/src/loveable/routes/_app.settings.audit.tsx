import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/settings/audit")({ component: () => {
  const data = Array.from({length: 16}).map((_, i) => ({ id: "log"+i, ts: "2025-11-"+((i%27)+1).toString().padStart(2,"0")+" 09:"+((i%59)).toString().padStart(2,"0"), user: ["admin","priya.s","rohan.v","finance.bot"][i%4], action: ["Approved VM-202"+i,"Updated employee record","Created invoice INV-84"+i,"Changed permission"][i%4], ip: "192.168.1."+(20+i) }));
  const cols: Column<typeof data[number]>[] = [
    { key: "ts", header: "Timestamp" }, { key: "user", header: "User" }, { key: "action", header: "Action" }, { key: "ip", header: "IP" },
  ];
  return <ModulePage title="Audit Logs" data={data} columns={cols} searchKeys={["user","action","ip"]} primaryAction="Export logs" />;
}});