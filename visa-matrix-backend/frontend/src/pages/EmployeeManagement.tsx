import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Filter, Lock, Unlock } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import env from "../../config/env";
import { useAuth } from "../../hooks/useAuth";

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

interface Employee {
  id: string;
  email: string;
  full_name: string;
  role: { name: string };
  department: { name: string };
  status: string;
  last_login_at: string;
  is_locked: boolean;
}

export default function EmployeeManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          status,
          last_login_at,
          is_locked,
          roles:role_id (id, name),
          departments:department_id (id, name)
        `)
        .neq("id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Fetch employees error:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || emp.role?.name === filterRole;
    const matchesStatus = !filterStatus || emp.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  async function toggleLock(employeeId: string, isLocked: boolean) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_locked: !isLocked,
          failed_login_attempts: 0,
        })
        .eq("id", employeeId);

      if (error) throw error;
      fetchEmployees();
    } catch (error) {
      console.error("Toggle lock error:", error);
    }
  }

  async function deleteEmployee(employeeId: string) {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ status: "deleted" })
          .eq("id", employeeId);

        if (error) throw error;
        fetchEmployees();
      } catch (error) {
        console.error("Delete employee error:", error);
      }
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="HR Manager">HR Manager</option>
          <option value="Visa Officer">Visa Officer</option>
          <option value="Employee">Employee</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Last Login</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{emp.full_name}</td>
                <td className="px-6 py-4 text-sm">{emp.email}</td>
                <td className="px-6 py-4 text-sm">{emp.role?.name || "N/A"}</td>
                <td className="px-6 py-4 text-sm">{emp.department?.name || "N/A"}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      emp.status === "active"
                        ? "bg-green-100 text-green-800"
                        : emp.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {emp.last_login_at
                    ? new Date(emp.last_login_at).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEmployee(emp);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => toggleLock(emp.id, emp.is_locked)}
                      className={emp.is_locked ? "text-orange-600 hover:text-orange-800" : "text-yellow-600 hover:text-yellow-800"}
                    >
                      {emp.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
