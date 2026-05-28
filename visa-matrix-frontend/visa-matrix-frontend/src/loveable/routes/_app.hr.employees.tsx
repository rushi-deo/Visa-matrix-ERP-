import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { employees, type Employee } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Column } from "@/components/common/DataTable";
export const Route = createFileRoute("/_app/hr/employees")({ component: () => {
  const cols: Column<Employee>[] = [
    { key: "name", header: "Employee", sortable: true, render: (r) => (
      <div className="flex items-center gap-2"><Avatar className="size-7"><AvatarImage src={r.avatar} /><AvatarFallback>{r.name[0]}</AvatarFallback></Avatar>
        <div><p className="font-medium leading-tight">{r.name}</p><p className="text-xs text-muted-foreground">{r.empId}</p></div></div>
    )},
    { key: "department", header: "Department" }, { key: "role", header: "Role" }, { key: "manager", header: "Manager" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "salary", header: "Salary", render: (r) => `$${r.salary.toLocaleString()}` },
  ];
  return <ModulePage title="Employees" description="Manage your workforce." data={employees} columns={cols} searchKeys={["name","empId","department","role"]} primaryAction="Add Employee" />;
}});
