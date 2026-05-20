import { useEffect, useState } from "react";
import Table from "../components/Table";
import { getApplications } from "../services/api";

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("approved")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("rejected")) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("processing") ||
    normalized.includes("submitted")
  ) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
};

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

const statusBuckets = [
  "Created",
  "Documents Pending",
  "Submitted",
  "Processing",
  "Approved",
  "Rejected",
];

export default function Applications({ searchQuery }) {
  const [applications, setApplications] = useState([]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      const result = await getApplications();

      if (active) {
        setApplications(result.items);
        setSource(result.source);
      }
    };

    loadApplications();

    return () => {
      active = false;
    };
  }, []);

  const filteredApplications = applications.filter((item) =>
    matchesSearch(item, searchQuery)
  );

  const columns = [
    {
      key: "applicantName",
      label: "Applicant Name",
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
        <span className={`status-pill border ${statusClassName(row.status)}`}>{row.status}</span>
      ),
    },
    { key: "createdDate", label: "Created Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Application Module</div>
          <h2 className="page-title mt-2">Visa application pipeline</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Track every visa case from creation through submission, processing,
            approval, or rejection.
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
          {source === "live" ? "Live application feed" : "Fallback application feed"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {statusBuckets.map((bucket) => {
          const count = applications.filter((item) => item.status === bucket).length;

          return (
            <div key={bucket} className="col-span-12 sm:col-span-6 xl:col-span-2">
              <div className="card-panel">
                <p className="text-sm text-slate-400">{bucket}</p>
                <p className="mt-3 text-3xl font-bold text-white">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Table
        title="Visa Applications"
        subtitle="Applications currently visible in the processing pipeline."
        columns={columns}
        rows={filteredApplications}
        footer={
          <p className="text-sm text-slate-400">
            {filteredApplications.length} applications match the current search scope.
          </p>
        }
      />
    </div>
  );
}
