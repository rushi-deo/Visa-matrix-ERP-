import { useEffect, useState } from "react";
import Table from "../components/Table";
import { getTasks } from "../services/api";

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("completed")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("escalated")) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }

  if (normalized.includes("progress") || normalized.includes("open")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
};

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Tasks({ searchQuery }) {
  const [tasks, setTasks] = useState([]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadTasks = async () => {
      const result = await getTasks();

      if (active) {
        setTasks(result.items);
        setSource(result.source);
      }
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, []);

  const filteredTasks = tasks.filter((item) => matchesSearch(item, searchQuery));
  const metrics = {
    open: tasks.filter((item) => item.status === "Open").length,
    inProgress: tasks.filter((item) => item.status === "In Progress").length,
    escalated: tasks.filter((item) => item.status === "Escalated").length,
    completed: tasks.filter((item) => item.status === "Completed").length,
  };

  const columns = [
    {
      key: "title",
      label: "Assigned Task",
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.title}</div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {row.application}
          </div>
        </div>
      ),
    },
    { key: "dueDate", label: "Due Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-pill border ${statusClassName(row.status)}`}>{row.status}</span>
      ),
    },
    { key: "assignedAgent", label: "Assigned Agent" },
    { key: "priority", label: "Priority" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Task Management</div>
          <h2 className="page-title mt-2">Assigned work and due dates</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Track operational tasks, due dates, case ownership, and escalations for
            every application in flight.
          </p>
        </div>
        <div
          className={[
            "status-pill border",
            source === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300",
          ].join(" ")}
        >
          {source === "live" ? "Live task feed" : "Fallback task feed"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {[
          { label: "Open", value: metrics.open, tone: "text-blue-300" },
          { label: "In Progress", value: metrics.inProgress, tone: "text-amber-300" },
          { label: "Escalated", value: metrics.escalated, tone: "text-rose-300" },
          { label: "Completed", value: metrics.completed, tone: "text-emerald-300" },
        ].map((metric) => (
          <div key={metric.label} className="col-span-12 md:col-span-6 xl:col-span-3">
            <div className="card-panel">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className={`mt-3 text-3xl font-bold ${metric.tone}`}>{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Table
        title="Task Board"
        subtitle="Assigned tasks, due dates, owners, and current state."
        columns={columns}
        rows={filteredTasks}
      />
    </div>
  );
}
