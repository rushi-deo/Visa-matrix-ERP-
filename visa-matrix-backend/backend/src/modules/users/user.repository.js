import supabase from "../../config/supabase.js";
import { createCrudRepository } from "../../core/baseRepository.js";
import { fromSupabaseError } from "../../core/errors.js";

const userCrudRepository = createCrudRepository({
  tableName: "users",
});

export const listUsers = (query = {}) => {
  return userCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      role: query.role,
    },
    searchTerm: query.search,
    searchColumns: ["full_name", "email"],
  });
};

export const findUserById = (userId) => {
  return userCrudRepository.findById(userId);
};

export const updateUserById = (userId, payload) => {
  return userCrudRepository.update(userId, payload);
};

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch user by email.");
  }

  return data;
};

/**
 * Get all users with their roles
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, user_roles(roles(name))")
      .order("full_name");

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return (data || []).map((user) => ({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.user_roles?.[0]?.roles?.name || user.role || "Employee",
    }));
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
};

/**
 * Get user by ID with role and permissions
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, user_roles(roles(name, id))")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.full_name,
      role: data.user_roles?.[0]?.roles?.name || data.role || "Employee",
      roleId: data.user_roles?.[0]?.roles?.id,
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};

/**
 * Update user's role
 */
export const updateUserRole = async (userId, roleId) => {
  try {
    // First check if user_roles entry exists
    const { data: existingRole, error: fetchError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing role:", fetchError);
      return null;
    }

    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabase
        .from("user_roles")
        .update({ role_id: roleId })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating user role:", updateError);
        return null;
      }
    } else {
      // Insert new role
      const { error: insertError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: roleId,
      });

      if (insertError) {
        console.error("Error inserting user role:", insertError);
        return null;
      }
    }

    return await getUserById(userId);
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return null;
  }
};
