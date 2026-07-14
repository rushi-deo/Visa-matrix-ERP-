import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CheckSquare, Clock, Award, FileText } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tasks } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
export const Route = createFileRoute("/_app/dashboard/employee")({ component: () => (
  <>
    <PageHeader title="My Dashboard" description="Your tasks, performance and assignments." />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard label="My Tasks" value="12" icon={CheckSquare} />
      <StatCard label="Hours This Week" value="38h" icon={Clock} accent="info" />
      <StatCard label="Performance" value="A+" icon={Award} accent="success" />
      <StatCard label="Open Cases" value="7" icon={FileText} accent="warning" />
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <ActivityFeed />
      <Card><CardHeader><CardTitle className="text-base">My Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2">{tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between border rounded-md p-2.5">
            <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.due}</p></div>
            <StatusBadge value={t.priority} />
          </div>
        ))}</CardContent></Card>
    </div>
  </>
) });
