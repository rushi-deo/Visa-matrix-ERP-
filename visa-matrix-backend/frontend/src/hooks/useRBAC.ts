import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";
import type { Role, PermissionDef } from "../types";

/**
 * Hook to fetch roles with permissions from backend
 */
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/roles");
      return response.data.data?.items || [];
    },
  });
}

/**
 * Hook to fetch role by ID with permissions
 */
export function useRole(roleId: string | null) {
  return useQuery({
    queryKey: ["role", roleId],
    queryFn: async () => {
      if (!roleId) return null;
      const response = await apiClient.get(`/admin/roles/${roleId}`);
      return response.data.data;
    },
    enabled: !!roleId,
  });
}

/**
 * Hook to fetch all available permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/permissions");
      return response.data.data?.items || [];
    },
  });
}

/**
 * Hook to fetch permissions for a role
 */
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return { role: null, permissions: [] };
      const response = await apiClient.get(
        `/admin/roles/${roleId}/permissions`,
      );
      return response.data.data;
    },
    enabled: !!roleId,
  });
}

/**
 * Hook to assign permission to role
 */
export function useAssignPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => {
      const response = await apiClient.post(
        `/admin/roles/${roleId}/permissions`,
        { permissionId },
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate role permissions cache
      queryClient.invalidateQueries({
        queryKey: ["role-permissions", variables.roleId],
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

/**
 * Hook to remove permission from role
 */
export function useRemovePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => {
      const response = await apiClient.delete(
        `/admin/roles/${roleId}/permissions/${permissionId}`,
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate role permissions cache
      queryClient.invalidateQueries({
        queryKey: ["role-permissions", variables.roleId],
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export default {
  useRoles,
  useRole,
  usePermissions,
  useRolePermissions,
  useAssignPermission,
  useRemovePermission,
};
