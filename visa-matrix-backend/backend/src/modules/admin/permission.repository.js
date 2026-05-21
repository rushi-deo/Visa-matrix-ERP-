import supabase from "../../config/supabase.js";

/**
 * Fetch all permissions for a role
 * Joins role_permissions and permissions tables
 */
export const getRolePermissions = async (roleId) => {
  try {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("permissions(id, name, description, module, action)")
      .eq("role_id", roleId);

    if (error) {
      console.error("Error fetching role permissions:", error);
      return [];
    }

    return (data || [])
      .filter((item) => item.permissions)
      .map((item) => item.permissions)
      .sort((first, second) =>
        `${first.module}:${first.action}`.localeCompare(
          `${second.module}:${second.action}`,
        ),
      );
  } catch (error) {
    console.error("Error in getRolePermissions:", error);
    return [];
  }
};

/**
 * Fetch permission names for a role (as array of strings)
 */
export const getRolePermissionNames = async (roleId) => {
  try {
    const permissions = await getRolePermissions(roleId);
    return permissions.map((p) => p.name);
  } catch (error) {
    console.error("Error in getRolePermissionNames:", error);
    return [];
  }
};

/**
 * Fetch all permissions available in the system
 */
export const getAllPermissions = async () => {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("id, name, description, module, action")
      .order("module")
      .order("action");

    if (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllPermissions:", error);
    return [];
  }
};

/**
 * Fetch permissions grouped by module
 */
export const getPermissionsByModule = async () => {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("id, name, description, module, action")
      .order("module")
      .order("action");

    if (error) {
      console.error("Error fetching permissions by module:", error);
      return {};
    }

    const grouped = {};
    (data || []).forEach((perm) => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    });

    return grouped;
  } catch (error) {
    console.error("Error in getPermissionsByModule:", error);
    return {};
  }
};

/**
 * Fetch permission by ID
 */
export const getPermissionById = async (permissionId) => {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("id, name, description, module, action")
      .eq("id", permissionId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching permission:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getPermissionById:", error);
    return null;
  }
};

/**
 * Fetch permission by name
 */
export const getPermissionByName = async (permissionName) => {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("id, name, description, module, action")
      .eq("name", permissionName)
      .maybeSingle();

    if (error) {
      console.error("Error fetching permission by name:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getPermissionByName:", error);
    return null;
  }
};

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (roleId, permissionId) => {
  try {
    const { data, error } = await supabase
      .from("role_permissions")
      .insert({
        role_id: roleId,
        permission_id: permissionId,
      })
      .select()
      .maybeSingle();

    if (error?.code === "23505") {
      const { data: existing, error: existingError } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId)
        .eq("permission_id", permissionId)
        .maybeSingle();

      if (existingError) {
        console.error("Error loading existing role permission:", existingError);
        return null;
      }

      return existing;
    }

    if (error) {
      console.error("Error assigning permission to role:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in assignPermissionToRole:", error);
    return null;
  }
};

/**
 * Replace all permissions for a role
 */
export const replaceRolePermissions = async (roleId, permissionIds = []) => {
  try {
    const nextPermissionIds = [...new Set(permissionIds)].filter(Boolean);

    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) {
      console.error("Error clearing role permissions:", deleteError);
      return null;
    }

    if (nextPermissionIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("role_permissions")
      .insert(
        nextPermissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
      )
      .select();

    if (error) {
      console.error("Error assigning permission to role:", error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error("Error in replaceRolePermissions:", error);
    return null;
  }
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (roleId, permissionId) => {
  try {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId);

    if (error) {
      console.error("Error removing permission from role:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in removePermissionFromRole:", error);
    return false;
  }
};

/**
 * Bulk assign permissions to role
 */
export const bulkAssignPermissionsToRole = async (roleId, permissionIds) => {
  try {
    const records = permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    const { data, error } = await supabase
      .from("role_permissions")
      .insert(records)
      .select();

    if (error) {
      console.error("Error bulk assigning permissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in bulkAssignPermissionsToRole:", error);
    return [];
  }
};

/**
 * Clear all permissions from role
 */
export const clearRolePermissions = async (roleId) => {
  try {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (error) {
      console.error("Error clearing role permissions:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in clearRolePermissions:", error);
    return false;
  }
};

export default {
  getRolePermissions,
  getRolePermissionNames,
  getAllPermissions,
  getPermissionsByModule,
  getPermissionById,
  getPermissionByName,
  assignPermissionToRole,
  replaceRolePermissions,
  removePermissionFromRole,
  bulkAssignPermissionsToRole,
  clearRolePermissions,
};
