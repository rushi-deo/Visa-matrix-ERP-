import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Users, Target, MessageCircle, TrendingUp } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
export const Route = createFileRoute("/_app/dashboard/crm")({ component: () => (
  <>
    <PageHeader title="CRM Dashboard" description="Pipeline, conversions and customer activity." />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard label="New Leads" value="64" delta={11} icon={Users} />
      <StatCard label="Qualified" value="28" delta={7.5} icon={Target} accent="info" />
      <StatCard label="Follow-ups" value="42" icon={MessageCircle} accent="warning" />
      <StatCard label="Conversion" value="32%" delta={3.1} icon={TrendingUp} accent="success" />
    </div>
    <div className="grid gap-4 lg:grid-cols-3"><RevenueChart /><ActivityFeed /></div>
  </>
) });
