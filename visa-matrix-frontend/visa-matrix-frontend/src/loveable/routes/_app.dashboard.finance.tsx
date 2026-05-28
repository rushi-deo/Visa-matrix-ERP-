import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Wallet, Receipt, AlertCircle, TrendingUp } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusPie } from "@/components/dashboard/StatusPie";
export const Route = createFileRoute("/_app/dashboard/finance")({ component: () => (
  <>
    <PageHeader title="Finance Dashboard" description="Revenue, invoices and collections." />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard label="Revenue (MTD)" value="$124,500" delta={18.7} icon={Wallet} accent="success" />
      <StatCard label="Open Invoices" value="42" icon={Receipt} accent="info" />
      <StatCard label="Overdue" value="$8,420" delta={-6.2} icon={AlertCircle} accent="destructive" />
      <StatCard label="Net Growth" value="+22%" delta={4.3} icon={TrendingUp} />
    </div>
    <div className="grid gap-4 lg:grid-cols-3"><RevenueChart /><StatusPie /></div>
  </>
) });
