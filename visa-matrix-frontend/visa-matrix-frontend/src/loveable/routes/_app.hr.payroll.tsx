import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { employees } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/hr/payroll")({ component: () => {
  const data = employees.map((e, i) => ({ id: e.id, employee: e.name, empId: e.empId, salary: e.salary, bonus: Math.round(e.salary*0.05), net: e.salary + Math.round(e.salary*0.05), status: i%5===0 ? "Pending" : "Paid" }));
  const cols: Column<typeof data[number]>[] = [
    { key: "empId", header: "Emp ID" }, { key: "employee", header: "Employee" },
    { key: "salary", header: "Base", render: (r) => `$${r.salary.toLocaleString()}` },
    { key: "bonus", header: "Bonus", render: (r) => `$${r.bonus.toLocaleString()}` },
    { key: "net", header: "Net Pay", render: (r) => `$${r.net.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];
  return <ModulePage title="Payroll" description="Monthly payroll runs and payslips." data={data} columns={cols} searchKeys={["employee","empId"]} primaryAction="Run Payroll" />;
}});
