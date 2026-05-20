import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiActivity, FiCpu, FiHardDrive, FiUsers, FiWifi } from "react-icons/fi";
import ChartCard from "./ChartCard";
import LogsPanel from "./LogsPanel";
import MapCard from "./MapCard";
import StatsCard from "./StatsCard";
import Table from "./Table";

const tooltipStyle = {
  backgroundColor: "#020617",
  border: "1px solid rgba(59, 130, 246, 0.2)",
  borderRadius: "16px",
  color: "#e2e8f0",
};

const statusTone = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("approved") || normalized.includes("paid")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("pending") || normalized.includes("processing")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (normalized.includes("rejected") || normalized.includes("failed")) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
};

export default function DashboardGrid({
  stats,
  cpuData,
  memoryData,
  networkData,
  markers,
  logs,
  recentApplications,
}) {
  const applicationColumns = [
    {
      key: "applicantName",
      label: "Applicant",
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.applicantName}</div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {row.assignedAgent}
          </div>
        </div>
      ),
    },
    { key: "country", label: "Country" },
    { key: "visaType", label: "Visa Type" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-pill border ${statusTone(row.status)}`}>{row.status}</span>
      ),
    },
    { key: "createdDate", label: "Created" },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          meta={stats.activeUsersMeta}
          icon={FiUsers}
          tone="blue"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatsCard
          title="Running Processes"
          value={stats.runningProcesses}
          meta={stats.runningProcessesMeta}
          icon={FiActivity}
          tone="emerald"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatsCard
          title="System Load"
          value={stats.systemLoad}
          meta={stats.systemLoadMeta}
          icon={FiCpu}
          tone="amber"
        />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatsCard
          title="Network Usage"
          value={stats.networkUsage}
          meta={stats.networkUsageMeta}
          icon={FiWifi}
          tone="cyan"
        />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <ChartCard title="CPU Usage" subtitle="Core utilization during visa workflows">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cpuData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#bfdbfe", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-12 xl:col-span-4">
        <ChartCard title="Memory Usage" subtitle="Resident set and cache pressure">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memoryData}>
              <defs>
                <linearGradient id="memoryFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="used"
                stroke="#38bdf8"
                fill="url(#memoryFill)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="cache"
                stroke="#f59e0b"
                fillOpacity={0}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-12 xl:col-span-4">
        <ChartCard title="Network Traffic" subtitle="Inbound and outbound data throughput">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={networkData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="inbound" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="outbound" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-12 xl:col-span-8">
        <MapCard markers={markers} />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <LogsPanel logs={logs} />
      </div>

      <div className="col-span-12">
        <Table
          title="Recent Visa Applications"
          subtitle="Latest applications entering the processing fabric."
          columns={applicationColumns}
          rows={recentApplications}
          footer={
            <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <FiHardDrive className="text-slate-500" />
                Backed by live API data when authentication is available
              </div>
              <span>Queue depth updated every dashboard refresh</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
