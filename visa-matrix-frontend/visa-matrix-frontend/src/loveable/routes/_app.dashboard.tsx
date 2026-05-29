import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Download,
  FileCheck2,
  Plane,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusPie } from "@/components/dashboard/StatusPie";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applications, countryStats, employees, invoices, leads, tasks } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({ component: Page });
function Page() {
  const totalApplications = applications.length;
  const pendingApprovals = applications.filter((application) =>
    ["Submitted", "Under Review", "On Hold"].includes(application.status),
  ).length;
  const activeEmployees = employees.filter((employee) => employee.status === "Active").length;
  const revenueMtd = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + invoice.amount, 0);
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const wonLeads = leads.filter((lead) => lead.stage === "Won").length;
  const customerGrowth = Math.round((wonLeads / Math.max(leads.length, 1)) * 100);

  const pipelineStages = ["Draft", "Submitted", "Under Review", "Approved"] as const;
  const pipeline = pipelineStages.map((status) => {
    const count = applications.filter((application) => application.status === status).length;
    return { status, count, value: Math.round((count / Math.max(totalApplications, 1)) * 100) };
  });

  const departmentActivity = employees.reduce<Record<string, number>>((acc, employee) => {
    acc[employee.department] = (acc[employee.department] ?? 0) + 1;
    return acc;
  }, {});

  const topDepartments = Object.entries(departmentActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="ERP Overview"
        description="Operational pulse across visa processing, approvals, CRM, HR, and finance."
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              Export
            </Button>
            <Button asChild>
              <Link to="/visa/applications/new">New Application</Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Applications" value={totalApplications} delta={12.4} icon={Plane} accent="primary" />
        <StatCard label="Pending Approvals" value={pendingApprovals} delta={-4.2} icon={FileCheck2} accent="warning" />
        <StatCard label="Active Employees" value={activeEmployees} delta={3.1} icon={Users} accent="info" />
        <StatCard label="Revenue MTD" value={`$${revenueMtd.toLocaleString()}`} delta={18.7} icon={Wallet} accent="success" />
        <StatCard label="Open Tasks" value={openTasks} hint="Across case workflows" icon={CheckCircle2} accent="destructive" />
        <StatCard label="Customer Growth" value={`${customerGrowth}%`} delta={6.8} icon={TrendingUp} accent="primary" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visa Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.status}</span>
                  <span className="text-muted-foreground">{stage.count} cases</span>
                </div>
                <Progress value={stage.value} />
              </div>
            ))}
            <Button asChild variant="outline" className="mt-2 w-full justify-between">
              <Link to="/visa/applications">
                Review applications
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <StatusPie />
        <RevenueChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityFeed />
        <Card>
          <CardHeader><CardTitle className="text-base">Country Distribution</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">Department Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topDepartments.map(([department, count]) => (
              <div key={department} className="flex items-center gap-3 rounded-md border p-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{department}</p>
                  <p className="text-xs text-muted-foreground">{count} active team members</p>
                </div>
                <Progress value={Math.round((count / employees.length) * 100)} className="w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Approval Work Queue</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {applications
              .filter((application) => ["Submitted", "Under Review", "On Hold"].includes(application.status))
              .slice(0, 6)
              .map((application) => (
                <div key={application.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{application.applicant}</p>
                      <p className="text-xs text-muted-foreground">
                        {application.appId} · {application.country}
                      </p>
                    </div>
                    <StatusBadge value={application.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{application.visaType}</span>
                    <span>{application.assignee}</span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Open Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {tasks.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
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
