import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestWithFallback } from "../api/apiClient";
import type { Role, PermissionDef } from "../types";

/**
 * Hook to fetch roles with permissions from backend
 */
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await requestWithFallback<{ items: Role[] }>({
        method: "GET",
        url: "/admin/roles",
      });
      return response.data.items || [];
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
      const response = await requestWithFallback<Role>({
        method: "GET",
        url: `/admin/roles/${roleId}`,
      });
      return response.data;
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
      const response = await requestWithFallback<{ items: PermissionDef[] }>({
        method: "GET",
        url: "/admin/permissions",
      });
      return response.data.items || [];
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
      const response = await requestWithFallback<{ role: Role; permissions: PermissionDef[] }>({
        method: "GET",
        url: `/admin/roles/${roleId}/permissions`,
      });
      return response.data;
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
      const response = await requestWithFallback<{ message?: string }>({
        method: "POST",
        url: `/admin/roles/${roleId}/permissions`,
        data: { permissionId },
      });
      return response.data;
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
      const response = await requestWithFallback<{ message?: string }>({
        method: "DELETE",
        url: `/admin/roles/${roleId}/permissions/${permissionId}`,
      });
      return response.data;
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
