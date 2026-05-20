import { useState, useMemo } from "react";
import {
  useRoles,
  usePermissions,
  useRolePermissions,
  useAssignPermission,
  useRemovePermission,
} from "../../hooks/useRBAC";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import type { Role, PermissionDef } from "../../types";

interface RolePermissionMatrixProps {
  onUpdate?: () => void;
}

/**
 * Role Permission Matrix UI
 * Displays roles as rows and permissions as columns
 * Allows toggling permissions per role
 */
export function RolePermissionMatrix({ onUpdate }: RolePermissionMatrixProps) {
  const rolesQuery = useRoles();
  const permissionsQuery = usePermissions();
  const assignMutation = useAssignPermission();
  const removeMutation = useRemovePermission();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const rolePermissionsQuery = useRolePermissions(selectedRoleId);

  const currentRolePermissions = useMemo(() => {
    if (!rolePermissionsQuery.data?.permissions) return [];
    return rolePermissionsQuery.data.permissions.map(
      (p: PermissionDef) => p.id,
    );
  }, [rolePermissionsQuery.data]);

  const handleTogglePermission = async (
    roleId: string,
    permissionId: string,
    isChecked: boolean,
  ) => {
    try {
      if (isChecked) {
        await assignMutation.mutateAsync({ roleId, permissionId });
      } else {
        await removeMutation.mutateAsync({ roleId, permissionId });
      }
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update permission:", error);
    }
  };

  if (rolesQuery.isLoading || permissionsQuery.isLoading) {
    return <LoadingState label="Loading roles and permissions..." />;
  }

  if (rolesQuery.isError || permissionsQuery.isError) {
    return (
      <ErrorState
        title="Failed to load"
        description="Could not load roles or permissions"
      />
    );
  }

  const roles = (rolesQuery.data || []) as Role[];
  const permissions = (permissionsQuery.data || []) as PermissionDef[];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                Role / Permission
              </th>
              {permissions.map((permission) => (
                <th
                  key={permission.id}
                  className="border border-gray-300 px-3 py-2 text-center font-semibold text-sm"
                  title={permission.description}
                >
                  <div className="rotate-90 origin-center inline-block whitespace-nowrap">
                    {permission.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedRoleId(role.id)}
              >
                <td className="border border-gray-300 px-4 py-3 font-medium">
                  {role.name}
                  {selectedRoleId === role.id && (
                    <span className="ml-2 text-blue-600">✓ Selected</span>
                  )}
                </td>
                {permissions.map((permission) => (
                  <td
                    key={`${role.id}-${permission.id}`}
                    className="border border-gray-300 px-3 py-3 text-center"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedRoleId === role.id &&
                        currentRolePermissions.includes(permission.id)
                      }
                      onChange={(e) =>
                        handleTogglePermission(
                          role.id,
                          permission.id,
                          e.target.checked,
                        )
                      }
                      disabled={
                        selectedRoleId !== role.id ||
                        rolePermissionsQuery.isLoading
                      }
                      className="cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRoleId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            {roles.find((r) => r.id === selectedRoleId)?.name} Permissions
          </h3>
          {rolePermissionsQuery.isLoading ? (
            <p className="text-sm text-blue-700">Loading permissions...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentRolePermissions.length > 0 ? (
                permissions
                  .filter((p) => currentRolePermissions.includes(p.id))
                  .map((p) => (
                    <span
                      key={p.id}
                      className="inline-block bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm"
                    >
                      {p.name}
                    </span>
                  ))
              ) : (
                <p className="text-sm text-blue-600">No permissions assigned</p>
              )}
            </div>
          )}
        </div>
      )}

      {assignMutation.isPending ||
        (removeMutation.isPending && (
          <div className="text-sm text-gray-600">Updating permissions...</div>
        ))}
    </div>
  );
}

export default RolePermissionMatrix;
