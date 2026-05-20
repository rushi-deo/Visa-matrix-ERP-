import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../components/ChartCard";
import { getReports } from "../services/api";

const tooltipStyle = {
  backgroundColor: "#020617",
  border: "1px solid rgba(59, 130, 246, 0.2)",
  borderRadius: "16px",
  color: "#e2e8f0",
};

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Reports({ searchQuery }) {
  const [reports, setReports] = useState({
    applicationsByCountry: [],
    revenueSeries: [],
    agentPerformance: [],
  });
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      const result = await getReports();

      if (active) {
        setReports({
          applicationsByCountry: result.applicationsByCountry,
          revenueSeries: result.revenueSeries,
          agentPerformance: result.agentPerformance,
        });
        setSource(result.source);
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const applicationsByCountry = reports.applicationsByCountry.filter((item) =>
    matchesSearch(item, searchQuery)
  );
  const revenueSeries = reports.revenueSeries.filter((item) =>
    matchesSearch(item, searchQuery)
  );
  const agentPerformance = reports.agentPerformance.filter((item) =>
    matchesSearch(item, searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Reporting Module</div>
          <h2 className="page-title mt-2">Operational analytics and revenue views</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Compare application volume by country, revenue performance, and agent
            throughput from a single reporting workspace.
          </p>
        </div>
        <div
          className={[
            "status-pill border",
            source === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : source === "mixed"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300",
          ].join(" ")}
        >
          {source === "live"
            ? "Live reports"
            : source === "mixed"
              ? "Mixed reports"
              : "Fallback reports"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-4">
          <ChartCard
            title="Applications by Country"
            subtitle="Country concentration across active application volume"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationsByCountry}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="country" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <ChartCard title="Revenue" subtitle="Projected versus collected revenue buckets">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  fill="url(#revenueFill)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#38bdf8"
                  fillOpacity={0}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <ChartCard title="Agent Performance" subtitle="Completed tasks and open load">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformance}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="agent" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="completed" fill="#22c55e" radius={[10, 10, 0, 0]} />
                <Bar dataKey="open" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
