import { useState } from "react";
import { Plus } from "lucide-react";

import DataTable from "../../components/common/DataTable";
import SectionCard from "../../components/common/SectionCard";
import {
  formatAccountCurrency,
  mockAccountsExpenses,
} from "../../services/accountsService";

const categories = ["Office", "Salaries", "Marketing", "Travel", "Vendor"];

export default function Expenses() {
  const [expenses, setExpenses] = useState(mockAccountsExpenses);
  const [form, setForm] = useState({
    category: "Office",
    vendor: "",
    amount: "",
    notes: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    setExpenses((current) => [
      {
        id: `EXP-${String(current.length + 1).padStart(3, "0")}`,
        category: form.category,
        vendor: form.vendor || "Internal",
        amount: Number(form.amount || 0),
        notes: form.notes || "No notes added",
        date: new Date().toISOString().slice(0, 10),
        status: "Pending",
      },
      ...current,
    ]);

    setForm({ category: "Office", vendor: "", amount: "", notes: "" });
  };

  const columns = [
    { key: "id", header: "Expense ID", render: (row) => row.id },
    { key: "category", header: "Category", render: (row) => row.category },
    { key: "vendor", header: "Vendor", render: (row) => row.vendor },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatAccountCurrency(row.amount),
    },
    { key: "notes", header: "Notes", render: (row) => row.notes },
    { key: "date", header: "Date", render: (row) => row.date },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            row.status === "Approved"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E5BB8]">
          Expense tracking
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Capture office, payroll, marketing, travel, and vendor spending in one
          place.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Manage approval workflows, log vendor payments, and review cost
          centers with a polished finance workspace.
        </p>
      </div>

      <SectionCard
        title="Add expense"
        description="Create a new finance entry and attach the relevant category, vendor, and notes."
      >
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-600">
            Expense category
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-600">
            Vendor
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
              value={form.vendor}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  vendor: event.target.value,
                }))
              }
              placeholder="Vendor name"
            />
          </label>

          <label className="block text-sm text-slate-600">
            Amount
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }
              placeholder="Enter amount"
            />
          </label>

          <label className="block text-sm text-slate-600 lg:col-span-2">
            Notes
            <textarea
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E5BB8]"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Expense notes and justification"
            />
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0B2E59] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Expense table"
        description="Current bookkeeping entries for office, salary, marketing, travel, and vendor spend."
      >
        <DataTable
          columns={columns}
          rows={expenses}
          emptyTitle="No expenses recorded"
          emptyDescription="Use the form above to create an expense record."
        />
      </SectionCard>
    </div>
  );
}
