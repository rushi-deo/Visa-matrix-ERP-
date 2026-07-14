import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Users, CalendarCheck, UserMinus, Award } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
export const Route = createFileRoute("/_app/dashboard/hr")({ component: () => (
  <>
    <PageHeader title="HR Dashboard" description="Workforce, attendance and leave overview." />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard label="Total Employees" value="148" delta={2.1} icon={Users} />
      <StatCard label="Present Today" value="132" delta={1.4} icon={CalendarCheck} accent="success" />
      <StatCard label="On Leave" value="9" icon={UserMinus} accent="warning" />
      <StatCard label="Top Performers" value="14" delta={5.2} icon={Award} accent="info" />
    </div>
    <div className="grid gap-4 lg:grid-cols-3"><RevenueChart /><ActivityFeed /></div>
  </>
) });
