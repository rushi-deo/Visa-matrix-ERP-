import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Plane, Users, Wallet, FileCheck2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusPie } from "@/components/dashboard/StatusPie";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countryStats, tasks } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";

export const Route = createFileRoute("/_app/dashboard")({ component: Page });
function Page() {
  return (
    <>
      <PageHeader title="Welcome back" description="Here's what's happening with your immigration operations today."
        actions={<><Button variant="outline"><Download className="size-4 mr-2" />Export</Button><Button>New application</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Applications" value="2,348" delta={12.4} icon={Plane} accent="primary" />
        <StatCard label="Active Employees" value="148" delta={3.1} icon={Users} accent="info" />
        <StatCard label="Pending Visas" value="86" delta={-4.2} icon={FileCheck2} accent="warning" />
        <StatCard label="Revenue (MTD)" value="$124,500" delta={18.7} icon={Wallet} accent="success" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <RevenueChart />
        <StatusPie />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityFeed />
        <Card>
          <CardHeader><CardTitle className="text-base">Top Destinations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {countryStats.map((c) => (
              <div key={c.country}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2"><span className="text-lg">{c.flag}</span>{c.country}</span>
                  <span className="text-muted-foreground">{c.count}</span>
                </div>
                <Progress value={c.count} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {tasks.slice(0,5).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.assignee} · {t.due}</p>
                </div>
                <StatusBadge value={t.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}