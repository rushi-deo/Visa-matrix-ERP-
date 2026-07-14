import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";

type Employee = { id: string; department?: string };

export const Route = createFileRoute("/_app/hr/departments")({
  component: Page,
});

function Page() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    let mounted = true;
    hrWorkspaceApi.getEmployees().then((response) => {
      if (!mounted) return;
      setEmployees(Array.isArray(response?.items) ? response.items : []);
    }).catch(() => {
      if (mounted) setEmployees([]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const map = new Map<string, number>();
  employees.forEach((e) => map.set(e.department ?? "Unassigned", (map.get(e.department ?? "Unassigned") ?? 0) + 1));

  return (
    <>
      <PageHeader title="Departments" description="Organizational structure." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...map.entries()].map(([name, count]) => (
          <Card key={name}>
            <CardContent className="p-5">
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{count} members</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
