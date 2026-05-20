import { useEffect, useState } from "react";
import DashboardGrid from "../components/DashboardGrid";
import {
  getApplications,
  getCustomers,
  getDashboardSeed,
  getDocuments,
  getPayments,
  getTasks,
} from "../services/api";

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Dashboard({ searchQuery }) {
  const [dashboardSeed] = useState(getDashboardSeed);
  const [applications, setApplications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const results = await Promise.all([
        getApplications(),
        getCustomers(),
        getDocuments(),
        getPayments(),
        getTasks(),
      ]);

      if (!active) {
        return;
      }

      const [applicationsResult, customersResult, documentsResult, paymentsResult, tasksResult] =
        results;

      setApplications(applicationsResult.items);
      setCustomers(customersResult.items);
      setDocuments(documentsResult.items);
      setPayments(paymentsResult.items);
      setTasks(tasksResult.items);

      const sources = results.map((result) => result.source);
      const dashboardSource = sources.every((entry) => entry === "live")
        ? "live"
        : sources.some((entry) => entry === "live")
          ? "mixed"
          : "mock";

      setSource(dashboardSource);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const filteredApplications = applications.filter((item) =>
    matchesSearch(item, searchQuery)
  );

  const averageCpu = Math.round(
    dashboardSeed.cpuUsage.reduce((sum, point) => sum + point.value, 0) /
      dashboardSeed.cpuUsage.length
  );
  const peakMemory = Math.max(...dashboardSeed.memoryUsage.map((point) => point.used));
  const networkBurst = dashboardSeed.networkTraffic.reduce(
    (sum, point) => sum + point.inbound + point.outbound,
    0
  );

  const stats = {
    activeUsers: `${customers.length * 18 || 108}`,
    activeUsersMeta: `${applications.length} live application streams`,
    runningProcesses: `${applications.length + tasks.length + documents.length || 16}`,
    runningProcessesMeta: `${tasks.length} operator tasks in motion`,
    systemLoad: `${averageCpu}%`,
    systemLoadMeta: `Peak memory ${peakMemory}%`,
    networkUsage: `${(networkBurst / 1000).toFixed(1)} Gbps`,
    networkUsageMeta: `${payments.length} billing events observed`,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Monitoring Dashboard</div>
          <h2 className="page-title mt-2">Visa Matrix operations fabric</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Monitoring-style telemetry overlaid with customer, application, and
            fulfillment activity across the full ERP stack.
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
          <span className="h-2 w-2 rounded-full bg-current" />
          {source === "live"
            ? "Live data connected"
            : source === "mixed"
              ? "Mixed live and mock data"
              : "Mock data active"}
        </div>
      </div>

      <DashboardGrid
        stats={stats}
        cpuData={dashboardSeed.cpuUsage}
        memoryData={dashboardSeed.memoryUsage}
        networkData={dashboardSeed.networkTraffic}
        markers={dashboardSeed.markers}
        logs={dashboardSeed.logs}
        recentApplications={filteredApplications.slice(0, 6)}
      />
    </div>
  );
}
