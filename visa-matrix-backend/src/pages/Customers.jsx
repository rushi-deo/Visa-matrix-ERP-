import { useEffect, useState } from "react";
import Form from "../components/Form";
import Table from "../components/Table";
import { getCustomers } from "../services/api";

const statusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("active")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (normalized.includes("pending") || normalized.includes("follow")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  return "border-blue-500/30 bg-blue-500/10 text-blue-300";
};

const initialFormValues = {
  name: "",
  email: "",
  phone: "",
  country: "India",
  status: "Active",
};

const customerFormFields = [
  { name: "name", label: "Customer Name", placeholder: "Enter full name" },
  { name: "email", label: "Email", type: "email", placeholder: "name@company.com" },
  { name: "phone", label: "Phone", placeholder: "+1 555 0199" },
  { name: "country", label: "Country", type: "text", placeholder: "Country" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Active", label: "Active" },
      { value: "Pending Review", label: "Pending Review" },
      { value: "Documents Pending", label: "Documents Pending" },
    ],
  },
];

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Customers({ searchQuery }) {
  const [customers, setCustomers] = useState([]);
  const [source, setSource] = useState("mock");
  const [formValues, setFormValues] = useState(initialFormValues);

  useEffect(() => {
    let active = true;

    const loadCustomers = async () => {
      const result = await getCustomers();

      if (active) {
        setCustomers(result.items);
        setSource(result.source);
      }
    };

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = customers.filter((item) => matchesSearch(item, searchQuery));

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.name}</div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {row.segment}
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "country", label: "Country" },
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
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500/40 hover:text-white"
          >
            View
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const handleFormChange = (name, value) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formValues.name || !formValues.email) {
      return;
    }

    setCustomers((current) => [
      {
        id: `local-${Date.now()}`,
        ...formValues,
        segment: "New Lead",
      },
      ...current,
    ]);
    setFormValues(initialFormValues);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">CRM Module</div>
          <h2 className="page-title mt-2">Customer intake and relationship desk</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Manage customer records, prioritize high-value leads, and capture new
            enquiries directly from the ERP control plane.
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
          {source === "live" ? "Live customer feed" : "Fallback customer feed"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <Table
            title="Customer Directory"
            subtitle="Active and pending customers across the visa pipeline."
            columns={columns}
            rows={filteredCustomers}
            footer={<p className="text-sm text-slate-400">{filteredCustomers.length} visible customers</p>}
          />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Form
            title="Add Customer"
            description="Quick intake form for onboarding a new customer record."
            fields={customerFormFields}
            values={formValues}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            submitLabel="Add Customer"
            footerNote="Prototype action updates the UI immediately. Attach POST /customers when write access is required."
          />
        </div>
      </div>
    </div>
  );
}
