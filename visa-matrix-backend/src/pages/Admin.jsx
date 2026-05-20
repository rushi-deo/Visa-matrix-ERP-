import { useEffect, useState } from "react";
import Form from "../components/Form";
import LogsPanel from "../components/LogsPanel";
import Table from "../components/Table";
import { getAdminSnapshot } from "../services/api";

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("active")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("review")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
};

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

const settingsFields = [
  {
    name: "supportEmail",
    label: "Support Email",
    type: "email",
    placeholder: "ops@visamatrix.io",
    fullWidth: true,
  },
  {
    name: "sessionTimeout",
    label: "Session Timeout",
    type: "select",
    options: [
      { value: "15 minutes", label: "15 minutes" },
      { value: "30 minutes", label: "30 minutes" },
      { value: "60 minutes", label: "60 minutes" },
    ],
  },
  {
    name: "storageRegion",
    label: "Storage Region",
    type: "select",
    options: [
      { value: "ap-south-1", label: "ap-south-1" },
      { value: "eu-west-1", label: "eu-west-1" },
      { value: "us-east-1", label: "us-east-1" },
    ],
  },
  {
    name: "autoAssign",
    label: "Auto Assignment",
    type: "select",
    options: [
      { value: "Enabled", label: "Enabled" },
      { value: "Disabled", label: "Disabled" },
    ],
    fullWidth: true,
  },
];

export default function Admin({ searchQuery }) {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({
    supportEmail: "",
    sessionTimeout: "30 minutes",
    storageRegion: "ap-south-1",
    autoAssign: "Enabled",
  });
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadAdmin = async () => {
      const result = await getAdminSnapshot();

      if (active) {
        setUsers(result.users);
        setAuditLogs(result.auditLogs);
        setSettings(result.settings);
        setSource(result.source);
      }
    };

    loadAdmin();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = users.filter((item) => matchesSearch(item, searchQuery));
  const filteredLogs = auditLogs.filter((item) => matchesSearch(item, searchQuery));

  const columns = [
    {
      key: "name",
      label: "User",
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.name}</div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {row.email}
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-pill border ${statusClassName(row.status)}`}>{row.status}</span>
      ),
    },
    { key: "lastSeen", label: "Last Seen" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <button
          type="button"
          className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200"
        >
          Manage
        </button>
      ),
    },
  ];

  const handleSettingsChange = (name, value) => {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSettingsSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Admin Panel</div>
          <h2 className="page-title mt-2">User management and system control</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Manage users, review audit trails, and configure platform-wide system
            settings for the Visa Matrix ERP environment.
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
          {source === "live" ? "Live admin feed" : "Fallback admin feed"}
        </div>
      </div>

      <Table
        title="User Management"
        subtitle="Access roles, account state, and recent user activity."
        columns={columns}
        rows={filteredUsers}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-6">
          <LogsPanel
            title="Audit Logs"
            subtitle="Critical administrative events and policy changes"
            logs={filteredLogs}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <Form
            title="System Settings"
            description="Control session, storage, and assignment defaults."
            fields={settingsFields}
            values={settings}
            onChange={handleSettingsChange}
            onSubmit={handleSettingsSubmit}
            submitLabel="Save Settings"
            footerNote="Prototype form is wired for UI state. Persist to /admin when write flows are required."
          />
        </div>
      </div>
    </div>
  );
}
