import supabase from "../../config/supabase.js";
import { normalizeRoleCode } from "../../config/rbac.js";

const roleSelectColumns = "id, name, description, created_at, organization_id, level, status";

const mapRoleRecord = (role) => {
  if (!role) {
    return null;
  }

  return {
    ...role,
    code: role.code ?? normalizeRoleCode(role.name),
  };
};

/**
 * Fetch user's role from database
 * Queries user_roles table with role details
 */
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role_id, roles(id, name)")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    if (!data?.roles) {
      return null;
    }

    return data.roles.name;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
};

/**
 * Fetch user's full role with details
 */
export const getUserRoleWithDetails = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, role_id, assigned_at, roles(id, name, description)")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role with details:", error);
      return null;
    }

    if (!data?.roles) {
      return null;
    }

    return {
      userRoleId: data.id,
      roleId: data.role_id,
      assignedAt: data.assigned_at,
      role: data.roles,
    };
  } catch (error) {
    console.error("Error in getUserRoleWithDetails:", error);
    return null;
  }
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId, roleId) => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role_id: roleId,
      })
      .select();

    if (error) {
      console.error("Error assigning role to user:", error);
      return null;
    }

    return data?.[0];
  } catch (error) {
    console.error("Error in assignRoleToUser:", error);
    return null;
  }
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId, roleId) => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", roleId);

    if (error) {
      console.error("Error removing role from user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in removeRoleFromUser:", error);
    return false;
  }
};

/**
 * Fetch all roles from database
 */
export const getAllRoles = async () => {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select(roleSelectColumns)
      .order("name");

    if (error) {
      console.error("Error fetching roles:", error);
      return [];
    }

    return (data || []).map(mapRoleRecord);
  } catch (error) {
    console.error("Error in getAllRoles:", error);
    return [];
  }
};

/**
 * Fetch role by ID
 */
export const getRoleById = async (roleId) => {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select(roleSelectColumns)
      .eq("id", roleId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching role:", error);
      return null;
    }

    return mapRoleRecord(data);
  } catch (error) {
    console.error("Error in getRoleById:", error);
    return null;
  }
};

/**
 * Fetch role by name
 */
export const getRoleByName = async (roleName) => {
  try {
    const canonicalRoleName = normalizeRoleCode(roleName);
    const lookupNames = new Set([
      roleName,
      String(roleName || "").trim(),
      String(roleName || "").trim().toLowerCase(),
      canonicalRoleName,
      canonicalRoleName.replace(/_/g, " "),
    ]);

    for (const lookupName of lookupNames) {
      if (!lookupName) {
        continue;
      }

      const { data, error } = await supabase
        .from("roles")
        .select(roleSelectColumns)
        .eq("name", lookupName)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role by name:", error);
        return null;
      }

      if (data) {
        return mapRoleRecord(data);
      }
    }

    return null;
  } catch (error) {
    console.error("Error in getRoleByName:", error);
    return null;
  }
};

/**
 * Update editable role metadata
 */
export const updateRoleById = async (roleId, payload) => {
  try {
    const updates = {
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
    };

    const { data, error } = await supabase
      .from("roles")
      .update(updates)
      .eq("id", roleId)
      .select(roleSelectColumns)
      .maybeSingle();

    if (error) {
      console.error("Error updating role:", error);
      return null;
    }

    return mapRoleRecord(data);
  } catch (error) {
    console.error("Error in updateRoleById:", error);
    return null;
  }
};

export default {
  getUserRole,
  getUserRoleWithDetails,
  assignRoleToUser,
  removeRoleFromUser,
  getAllRoles,
  getRoleById,
  getRoleByName,
  updateRoleById,
};
