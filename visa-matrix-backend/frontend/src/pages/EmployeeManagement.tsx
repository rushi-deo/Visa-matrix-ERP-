import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Search,
  Lock,
  Unlock,
  UserCircle2,
  X,
  ChevronLeft,
} from "lucide-react";

import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import * as employeeApi from "../services/employeeService";
import type {
  Employee,
  EmployeeFormOptions,
  EmployeePayload,
  EmploymentStatus,
} from "../types/employee";

const STATUS_OPTIONS: EmploymentStatus[] = [
  "pending",
  "active",
  "suspended",
  "inactive",
];

const EMPTY_FORM: EmployeePayload & { email: string; fullName: string } = {
  email: "",
  fullName: "",
  phone: "",
  employeeCode: "",
  designation: "",
  joiningDate: "",
  departmentId: "",
  roleId: "",
  branchId: "",
  reportingManagerId: "",
  profilePhoto: "",
  status: "pending",
};

function statusClass(status: string) {
  if (status === "active") return "bg-green-100 text-green-800";
  if (status === "pending") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export default function EmployeeManagement() {
  const { user } = useAuth();
  const { can, hasRole } = usePermissions();
  const canManage =
    hasRole(["Super Admin", "Admin", "HR Manager"]) || can("hr:edit");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [options, setOptions] = useState<EmployeeFormOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, formOptions] = await Promise.all([
        employeeApi.fetchEmployees({
          search: searchTerm || undefined,
          role: filterRole || undefined,
          status: filterStatus || undefined,
          limit: 100,
        }),
        canManage ? employeeApi.fetchEmployeeOptions() : Promise.resolve(null),
      ]);
      setEmployees(list.items);
      setOptions(formOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole, filterStatus, canManage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const managerOptions = useMemo(() => {
    if (!options?.managers) return [];
    if (!selected?.id) return options.managers;
    return options.managers.filter((manager) => manager.id !== selected.id);
  }, [options, selected]);

  function openCreate() {
    setSelected(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(employee: Employee) {
    setSelected(employee);
    setForm({
      email: employee.email,
      fullName: employee.fullName,
      phone: employee.phone || "",
      employeeCode: employee.employeeId || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate || "",
      departmentId: employee.department?.id || "",
      roleId: employee.role?.id || "",
      branchId: employee.branch?.id || "",
      reportingManagerId: employee.reportingTo?.id || "",
      profilePhoto: employee.profilePhoto || "",
      status: employee.employmentStatus,
    });
    setShowModal(true);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!canManage) return;

    setSaving(true);
    setError("");

    try {
      const payload: EmployeePayload & { email?: string; fullName?: string } = {
        fullName: form.fullName,
        phone: form.phone || null,
        employeeCode: form.employeeCode || null,
        designation: form.designation || null,
        joiningDate: form.joiningDate || null,
        departmentId: form.departmentId || null,
        roleId: form.roleId || null,
        branchId: form.branchId || null,
        reportingManagerId: form.reportingManagerId || null,
        profilePhoto: form.profilePhoto || null,
        status: form.status,
      };

      if (selected) {
        await employeeApi.updateEmployee(selected.id, payload);
      } else {
        await employeeApi.createEmployee({
          ...payload,
          email: form.email,
          fullName: form.fullName,
        });
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleLock(employee: Employee) {
    if (!canManage) return;
    try {
      await employeeApi.toggleEmployeeLock(employee.id, !employee.isLocked);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lock status");
    }
  }

  if (loading && employees.length === 0) {
    return <LoadingState label="Loading employee directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/hr"
            className="mb-2 inline-flex items-center gap-1 text-sm text-[#1E5BB8] hover:underline"
          >
            <ChevronLeft size={16} />
            HR Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
          <p className="mt-1 text-slate-600">
            Enterprise identity, reporting hierarchy, and employment records
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E5BB8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174B98]"
          >
            <Plus size={18} />
            Add Employee
          </button>
        ) : null}
      </div>

      {error ? (
        <ErrorState title="Employee operation failed" description={error} />
      ) : null}

      <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[220px] flex-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">All Roles</option>
          {options?.roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void loadData()}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[960px]">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role / Dept
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reports To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Branch
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="flex items-center gap-3 text-left"
                    onClick={() => setDetailEmployee(emp)}
                  >
                    {emp.profilePhoto ? (
                      <img
                        src={emp.profilePhoto}
                        alt={emp.fullName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserCircle2 size={22} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{emp.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {emp.employeeId || "—"} • {emp.email}
                      </p>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  <p>{emp.role?.name || "—"}</p>
                  <p className="text-xs text-slate-500">
                    {emp.designation || "No designation"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {emp.department?.name || "No department"}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {emp.reportingTo?.label || "—"}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {emp.branch?.name || "—"}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(emp.employmentStatus)}`}
                  >
                    {emp.employmentStatus}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {canManage ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(emp)}
                        className="rounded-lg p-2 text-[#1E5BB8] hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleLock(emp)}
                        className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                        title={emp.isLocked ? "Unlock" : "Lock"}
                      >
                        {emp.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No employees match your filters.
          </p>
        ) : null}
      </div>

      {detailEmployee ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Employee Profile
              </h2>
              <button
                type="button"
                onClick={() => setDetailEmployee(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Employee ID</dt>
                <dd className="font-medium">{detailEmployee.employeeId || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Full Name</dt>
                <dd className="font-medium">{detailEmployee.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium">{detailEmployee.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium">{detailEmployee.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Role</dt>
                <dd className="font-medium">{detailEmployee.role?.name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Designation</dt>
                <dd className="font-medium">
                  {detailEmployee.designation || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium">
                  {detailEmployee.department?.name || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Reports To</dt>
                <dd className="text-right font-medium">
                  {detailEmployee.reportingTo?.label || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Branch</dt>
                <dd className="font-medium">{detailEmployee.branch?.name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Joining Date</dt>
                <dd className="font-medium">
                  {detailEmployee.joiningDate
                    ? new Date(detailEmployee.joiningDate).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium capitalize">
                  {detailEmployee.employmentStatus}
                </dd>
              </div>
            </dl>
            {canManage ? (
              <button
                type="button"
                onClick={() => {
                  openEdit(detailEmployee);
                  setDetailEmployee(null);
                }}
                className="mt-6 w-full rounded-xl bg-[#1E5BB8] py-2.5 text-sm font-semibold text-white"
              >
                Edit Employee
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showModal && canManage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form
            onSubmit={handleSave}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {selected ? "Edit Employee" : "Add Employee"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {!selected ? (
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Email *
                  </span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </label>
              ) : null}

              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Full Name *
                </span>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Employee ID
                </span>
                <input
                  value={form.employeeCode || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      employeeCode: e.target.value,
                    }))
                  }
                  placeholder="Auto-generated if empty"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Phone
                </span>
                <input
                  value={form.phone || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Designation
                </span>
                <input
                  value={form.designation || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      designation: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Joining Date
                </span>
                <input
                  type="date"
                  value={form.joiningDate || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      joiningDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </span>
                <select
                  value={form.roleId || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, roleId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Select role</option>
                  {options?.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Department
                </span>
                <select
                  value={form.departmentId || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      departmentId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Select department</option>
                  {options?.departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Branch
                </span>
                <select
                  value={form.branchId || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, branchId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">Select branch</option>
                  {options?.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Reporting To
                </span>
                <select
                  value={form.reportingManagerId || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      reportingManagerId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">No manager</option>
                  {managerOptions.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Employment Status
                </span>
                <select
                  value={form.status || "pending"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as EmploymentStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Profile Photo URL
                </span>
                <input
                  type="url"
                  value={form.profilePhoto || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      profilePhoto: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#1E5BB8] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : selected ? "Update Employee" : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {!canManage ? (
        <p className="text-center text-sm text-slate-500">
          Signed in as {user?.role}. You have read-only directory access.
        </p>
      ) : null}
    </div>
  );
}
