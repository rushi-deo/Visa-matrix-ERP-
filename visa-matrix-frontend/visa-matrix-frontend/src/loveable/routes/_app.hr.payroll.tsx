import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";
import { asApiRecords, readApiString, readApiValue } from "@/lib/api-record";

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
      const items = asApiRecords(response?.items);
      setData(items.flatMap((employee) => {
        const id = readApiString(employee, ["id", "employee_id"]);
        if (!id) return [];
        const salary = Number(readApiValue(employee, ["salary", "base_salary"]) ?? 0);
        const bonus = Math.round(salary * 0.05);
        return [{
          id,
          employee: readApiString(employee, ["name", "full_name"]) ?? "Employee",
          empId: readApiString(employee, ["employee_code", "empId"]) ?? "",
          salary,
          bonus,
          net: salary + bonus,
          status: "Paid",
        }];
      }));
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
