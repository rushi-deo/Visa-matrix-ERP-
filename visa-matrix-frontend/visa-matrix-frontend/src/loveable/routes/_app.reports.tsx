import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TrendingUp, Users, Plane, Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusPie } from "@/components/dashboard/StatusPie";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/_app/reports")({ component: () => (
  <>
    <PageHeader title="Reports & Analytics" description="Slice and export business insights."
      actions={<><Input type="date" className="w-40" /><Input type="date" className="w-40" /><Button variant="outline"><Download className="size-4 mr-2" />Export</Button></>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard label="Visa Success Rate" value="91.4%" delta={2.3} icon={TrendingUp} accent="success" />
      <StatCard label="Customers" value="2,184" delta={8.1} icon={Users} />
      <StatCard label="Applications" value="2,348" delta={12.4} icon={Plane} accent="info" />
      <StatCard label="Revenue YTD" value="$1.04M" delta={22.6} icon={Wallet} accent="success" />
    </div>
    <div className="grid gap-4 lg:grid-cols-3"><RevenueChart /><StatusPie /></div>
  </>
) });
