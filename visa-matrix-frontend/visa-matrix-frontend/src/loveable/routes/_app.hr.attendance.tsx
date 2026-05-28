import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CalendarCheck, UserMinus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { employees } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
export const Route = createFileRoute("/_app/hr/attendance")({ component: () => (
  <>
    <PageHeader title="Attendance" description="Daily attendance and time tracking." />
    <div className="grid gap-4 sm:grid-cols-3 mb-6">
      <StatCard label="Present" value="132" icon={CalendarCheck} accent="success" />
      <StatCard label="On Leave" value="9" icon={UserMinus} accent="warning" />
      <StatCard label="Late check-ins" value="7" icon={Clock} accent="info" />
    </div>
    <Card><CardHeader><CardTitle className="text-base">Today's Attendance</CardTitle></CardHeader>
      <CardContent className="divide-y">{employees.slice(0,10).map((e) => (
        <div key={e.id} className="flex items-center justify-between py-2.5">
          <div><p className="text-sm font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.department}</p></div>
          <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">09:0{Math.floor(Math.random()*9)}</span><StatusBadge value={e.status} /></div>
        </div>
      ))}</CardContent></Card>
  </>
) });
