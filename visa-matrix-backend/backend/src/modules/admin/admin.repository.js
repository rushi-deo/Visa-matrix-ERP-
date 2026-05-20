import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";
import {
  buildPaginationMeta,
  getPaginationOptions,
} from "../../utils/pagination.js";

const countTableRows = async (tableName) => {
  const { count, error } = await supabase
    .from(tableName)
    .select("*", { head: true, count: "exact" });

  if (error) {
    throw fromSupabaseError(error, `Failed to count ${tableName}.`);
  }

  return count || 0;
};

export const listAdminUsers = async ({ page = 1, limit = 20, search = "" } = {}) => {
  const pagination = getPaginationOptions(page, limit);
  let query = supabase
    .from("profiles")
    .select(
      `
        id,
        auth_user_id,
        full_name,
        email,
        phone,
        role,
        organization_id,
        is_active,
        status,
        created_at,
        organizations(id, name),
        user_roles(role_id, roles(id, code, name, description))
      `,
      { count: "exact" },
    );

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  const { data, error, count } = await query;

  if (error) {
    throw fromSupabaseError(error, "Failed to load admin users.");
  }

  return {
    items: (data || []).map((user) => {
      const assignedRole = user.user_roles?.[0]?.roles || null;

      return {
        id: user.id,
        auth_user_id: user.auth_user_id,
        name: user.full_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: assignedRole?.name || user.role,
        roleId: assignedRole?.id || null,
        roleCode: assignedRole?.code || user.role,
        organization_id: user.organization_id,
        organization_name: user.organizations?.name || "Visa Matrix",
        is_active: user.is_active !== false && user.status !== "inactive",
        status: user.status || (user.is_active === false ? "inactive" : "active"),
        created_at: user.created_at,
      };
    }),
    pagination: buildPaginationMeta(count || 0, pagination.page, pagination.limit),
  };
};

export const updateAdminUserRole = async (userId, roleId) => {
  const { error: deleteError } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw fromSupabaseError(deleteError, "Failed to clear existing user role.");
  }

  const { error: insertError } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: roleId,
  });

  if (insertError) {
    throw fromSupabaseError(insertError, "Failed to assign user role.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, organization_id, is_active, status, organizations(id, name), user_roles(role_id, roles(id, code, name, description))",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to load updated user.");
  }

  const assignedRole = data?.user_roles?.[0]?.roles || null;
  return {
    id: data.id,
    name: data.full_name,
    full_name: data.full_name,
    email: data.email,
    role: assignedRole?.name || data.role,
    roleId: assignedRole?.id || null,
    roleCode: assignedRole?.code || data.role,
    organization_id: data.organization_id,
    organization_name: data.organizations?.name || "Visa Matrix",
    is_active: data.is_active !== false && data.status !== "inactive",
    status: data.status || (data.is_active === false ? "inactive" : "active"),
  };
};

export const updateAdminUserStatus = async (userId, isActive) => {
  const nextStatus = isActive ? "active" : "inactive";
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: isActive, status: nextStatus })
    .eq("id", userId)
    .select(
      "id, full_name, email, role, organization_id, is_active, status, organizations(id, name), user_roles(role_id, roles(id, code, name, description))",
    )
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to update user status.");
  }

  const assignedRole = data?.user_roles?.[0]?.roles || null;
  return {
    id: data.id,
    name: data.full_name,
    full_name: data.full_name,
    email: data.email,
    role: assignedRole?.name || data.role,
    roleId: assignedRole?.id || null,
    roleCode: assignedRole?.code || data.role,
    organization_id: data.organization_id,
    organization_name: data.organizations?.name || "Visa Matrix",
    is_active: data.is_active !== false && data.status !== "inactive",
    status: data.status || nextStatus,
  };
};

export const listAuditLogs = async ({
  page = 1,
  limit = 20,
  entityType,
  action,
} = {}) => {
  const pagination = getPaginationOptions(page, limit);
  let query = supabase.from("audit_logs").select("*", { count: "exact" });

  if (entityType) {
    query = query.eq("entity_type", entityType);
  }

  if (action) {
    query = query.eq("action", action);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  const { data, error, count } = await query;

  if (error) {
    throw fromSupabaseError(error, "Failed to load audit logs.");
  }

  return {
    items: data || [],
    pagination: buildPaginationMeta(count || 0, pagination.page, pagination.limit),
  };
};

export const getSystemStats = async () => {
  const [users, customers, applications, payments, tasks] = await Promise.all([
    countTableRows("profiles"),
    countTableRows("customers"),
    countTableRows("applications"),
    countTableRows("payments"),
    countTableRows("tasks"),
  ]);

  return {
    users,
    customers,
    applications,
    payments,
    tasks,
  };
};
