import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CalendarCheck, UserMinus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { hrWorkspaceApi } from "@erp/features/hr/api/hrWorkspaceApi";

type Employee = { id: string; name: string; department?: string; status?: string };

export const Route = createFileRoute("/_app/hr/attendance")({
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

  return (
    <>
      <PageHeader title="Attendance" description="Daily attendance and time tracking." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Present" value="132" icon={CalendarCheck} accent="success" />
        <StatCard label="On Leave" value="9" icon={UserMinus} accent="warning" />
        <StatCard label="Late check-ins" value="7" icon={Clock} accent="info" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Today's Attendance</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {employees.slice(0, 10).map((e, index) => (
            <div key={e.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.department}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">09:0{index}</span>
                <StatusBadge value={e.status ?? ""} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
