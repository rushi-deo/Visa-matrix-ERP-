import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import env from "../../config/env";

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  status: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", level: 0 });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  async function fetchRoles() {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("level", { ascending: false });

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error("Fetch roles error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPermissions() {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module");

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("Fetch permissions error:", error);
    }
  }

  async function selectRole(role: Role) {
    setSelectedRole(role);

    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .eq("role_id", role.id);

      if (error) throw error;
      setRolePermissions(data?.map((p: any) => p.permission_id) || []);
    } catch (error) {
      console.error("Fetch role permissions error:", error);
    }
  }

  async function togglePermission(permissionId: string, isSelected: boolean) {
    if (!selectedRole) return;

    try {
      if (isSelected) {
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", selectedRole.id)
          .eq("permission_id", permissionId);

        if (error) throw error;
        setRolePermissions(rolePermissions.filter((p) => p !== permissionId));
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .insert([
            {
              role_id: selectedRole.id,
              permission_id: permissionId,
            },
          ]);

        if (error) throw error;
        setRolePermissions([...rolePermissions, permissionId]);
      }
    } catch (error) {
      console.error("Toggle permission error:", error);
    }
  }

  async function createRole() {
    if (!newRole.name) {
      alert("Please enter a role name");
      return;
    }

    try {
      const { error } = await supabase.from("roles").insert([
        {
          name: newRole.name,
          description: newRole.description,
          level: newRole.level,
          status: "active",
        },
      ]);

      if (error) throw error;
      setNewRole({ name: "", description: "", level: 0 });
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      console.error("Create role error:", error);
    }
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Roles</h2>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  selectedRole?.id === role.id
                    ? "bg-blue-100 border border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="font-semibold">{role.name}</div>
                <div className="text-xs text-gray-600">{role.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedRole ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">{selectedRole.name} - Permissions</h2>

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module}>
                  <h3 className="font-semibold text-lg mb-3 capitalize">{module}</h3>
                  <div className="space-y-2 ml-4">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={rolePermissions.includes(perm.id)}
                          onChange={(e) =>
                            togglePermission(perm.id, e.target.checked)
                          }
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium">{perm.name}</div>
                          <div className="text-sm text-gray-600">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Select a role to manage permissions
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Role</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={newRole.level}
                  onChange={(e) =>
                    setNewRole({ ...newRole, level: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={0}>Employee</option>
                  <option value={1}>Manager</option>
                  <option value={2}>Director</option>
                  <option value={3}>Admin</option>
                  <option value={4}>Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createRole}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} />
                  Create Role
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
