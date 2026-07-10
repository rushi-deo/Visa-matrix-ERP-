import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ModulePage } from "@/components/common/ModulePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Column } from "@/components/common/DataTable";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";

type Employee = {
  id: string;
  employee_code?: string;
  name: string;
  email?: string;
  department?: string;
  job_title?: string;
  reporting_manager?: string;
  status?: string;
  salary?: number;
  avatar?: string;
};

export const Route = createFileRoute("/_app/hr/employees")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    let mounted = true;
    hrWorkspaceApi
      .getEmployees()
      .then((result) => {
        if (!mounted) return;
        setEmployees(Array.isArray(result?.items) ? result.items : []);
      })
      .catch(() => {
        if (mounted) setEmployees([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cols: Column<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarImage src={r.avatar} />
            <AvatarFallback>{r.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-tight">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.employee_code}</p>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department" },
    { key: "job_title", header: "Role" },
    { key: "reporting_manager", header: "Manager" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status ?? ""} /> },
    { key: "salary", header: "Salary", render: (r) => `$${Number(r.salary ?? 0).toLocaleString()}` },
  ];

  return (
    <ModulePage
      title="Employees"
      description="Manage your workforce."
      data={employees}
      columns={cols}
      searchKeys={["name", "employee_code", "department", "job_title"]}
      primaryAction="Add Employee"
      onRowClick={(row) =>
        navigate({
          to: "/hr/employees/$id",
          params: { id: row.id },
        })
      }
    />
  );
}
