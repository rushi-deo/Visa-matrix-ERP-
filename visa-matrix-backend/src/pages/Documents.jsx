import { useEffect, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi";
import StatsCard from "../components/StatsCard";
import Table from "../components/Table";
import { getDocuments } from "../services/api";

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("verified") || normalized.includes("approved")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("pending") || normalized.includes("uploaded")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
};

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Documents({ searchQuery }) {
  const [documents, setDocuments] = useState([]);
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadDocuments = async () => {
      const result = await getDocuments();

      if (active) {
        setDocuments(result.items);
        setSource(result.source);
      }
    };

    loadDocuments();

    return () => {
      active = false;
    };
  }, []);

  const filteredDocuments = documents.filter((item) =>
    matchesSearch(item, searchQuery)
  );
  const verified = documents.filter((item) =>
    ["verified", "approved"].includes(item.status.toLowerCase())
  ).length;
  const pending = documents.filter((item) =>
    ["pending review", "uploaded"].includes(item.status.toLowerCase())
  ).length;
  const issues = documents.length - verified - pending;

  const columns = [
    { key: "customer", label: "Customer" },
    { key: "documentType", label: "Document Type" },
    { key: "uploadDate", label: "Upload Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-pill border ${statusClassName(row.status)}`}>{row.status}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            Review
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            Request Fix
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Document Management</div>
          <h2 className="page-title mt-2">Uploaded files and verification queue</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Monitor uploaded evidence, review verification state, and trigger case
            follow-ups when documents fail validation.
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
          {source === "live" ? "Live document feed" : "Fallback document feed"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <StatsCard
            title="Verified"
            value={verified}
            meta="Documents ready for submission"
            icon={FiCheckCircle}
            tone="emerald"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <StatsCard
            title="Pending Review"
            value={pending}
            meta="Awaiting operations review"
            icon={FiClock}
            tone="amber"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <StatsCard
            title="Issues"
            value={issues}
            meta="Documents requiring remediation"
            icon={FiAlertTriangle}
            tone="blue"
          />
        </div>
      </div>

      <Table
        title="Document Register"
        subtitle="Uploaded files across active customers and applications."
        columns={columns}
        rows={filteredDocuments}
      />
    </div>
  );
}
