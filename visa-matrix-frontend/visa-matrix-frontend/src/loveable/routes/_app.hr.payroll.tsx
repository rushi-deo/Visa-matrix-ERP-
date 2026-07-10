import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";

type Payroll = { id: string; employee: string; empId: string; salary: number; bonus: number; net: number; status: string };

export const Route = createFileRoute("/_app/hr/payroll")({
  component: Page,
});

function Page() {
  const [data, setData] = useState<Payroll[]>([]);

  useEffect(() => {
    let mounted = true;
    hrWorkspaceApi.getEmployees().then((response) => {
      if (!mounted) return;
      const items = Array.isArray(response?.items) ? response.items : [];
      setData(items.map((e: any) => ({
        id: e.id,
        employee: e.name,
        empId: e.employee_code ?? e.empId ?? "",
        salary: Number(e.salary ?? 0),
        bonus: Math.round(Number(e.salary ?? 0) * 0.05),
        net: Number(e.salary ?? 0) + Math.round(Number(e.salary ?? 0) * 0.05),
        status: "Paid",
      })));
    }).catch(() => mounted && setData([]));
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<Payroll>[] = [
    { key: "empId", header: "Emp ID" },
    { key: "employee", header: "Employee" },
    { key: "salary", header: "Base", render: (r) => `$${r.salary.toLocaleString()}` },
    { key: "bonus", header: "Bonus", render: (r) => `$${r.bonus.toLocaleString()}` },
    { key: "net", header: "Net Pay", render: (r) => `$${r.net.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return <ModulePage title="Payroll" description="Monthly payroll runs and payslips." data={data} columns={cols} searchKeys={["employee", "empId"]} primaryAction="Run Payroll" />;
}
