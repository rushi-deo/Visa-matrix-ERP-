import supabase from "../config/supabase.js";
import { hasRoleAccess } from "../config/rbac.js";
import {
  buildWorkflowMetadata,
  EMPLOYEE_PROFILE_SELECT,
  mapEmployeeRecord,
  wouldCreateReportingCycle,
} from "../utils/employeeHierarchy.js";

const HR_MANAGER_ROLES = ["Super Admin", "Admin", "HR Manager"];

export function canManageAllEmployees(actor) {
  return hasRoleAccess(actor?.role || actor?.roles?.name, HR_MANAGER_ROLES);
}

function generateEmployeeCode() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `VM-${year}-${suffix}`;
}

async function resolveOrganizationId(actor) {
  return (
    actor?.organization_id ||
    actor?.organizationId ||
    (
      await supabase
        .from("organizations")
        .select("id")
        .eq("slug", "visa-matrix")
        .maybeSingle()
    ).data?.id
  );
}

function applyEmployeeListScope(query, actor) {
  if (canManageAllEmployees(actor)) {
    return query;
  }

  return query.eq("reporting_manager_id", actor.id);
}

export async function listEmployees(actor, filters = {}) {
  const {
    page = 1,
    limit = 20,
    role,
    department,
    status,
    search,
  } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select(EMPLOYEE_PROFILE_SELECT, { count: "exact" })
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  query = applyEmployeeListScope(query, actor);

  if (status) {
    query = query.eq("status", status);
  }

  if (department) {
    query = query.eq("department_id", department);
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,employee_code.ilike.%${search}%`,
    );
  }

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  let items = (data || []).map(mapEmployeeRecord);

  if (role) {
    items = items.filter((item) => item.role?.name === role);
  }

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize: limit,
  };
}

export async function getEmployeeById(actor, employeeId) {
  let query = supabase
    .from("profiles")
    .select(EMPLOYEE_PROFILE_SELECT)
    .eq("id", employeeId)
    .neq("status", "deleted")
    .maybeSingle();

  if (!canManageAllEmployees(actor)) {
    query = query.eq("reporting_manager_id", actor.id);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapEmployeeRecord(data);
}

export async function getEmployeeFormOptions(actor) {
  const organizationId = await resolveOrganizationId(actor);

  const [departments, roles, branches, managers] = await Promise.all([
    supabase
      .from("departments")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("name"),
    supabase
      .from("roles")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("name"),
    supabase
      .from("branches")
      .select("id, name, code")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("name"),
    supabase
      .from("profiles")
      .select(
        "id, full_name, designation, employee_code, roles:role_id (name)",
      )
      .eq("organization_id", organizationId)
      .neq("status", "deleted")
      .in("status", ["active", "pending"])
      .order("full_name"),
  ]);

  return {
    departments: departments.data || [],
    roles: roles.data || [],
    branches: branches.data || [],
    managers: (managers.data || []).map((manager) => ({
      id: manager.id,
      fullName: manager.full_name,
      designation: manager.designation,
      employeeId: manager.employee_code,
      roleName: manager.roles?.name,
      label: `${manager.full_name} — ${manager.designation || manager.roles?.name || "Manager"}`,
    })),
  };
}

export async function getHrDashboardSummary(actor) {
  const organizationId = await resolveOrganizationId(actor);

  let query = supabase
    .from("profiles")
    .select("id, status, joining_date, reporting_manager_id", { count: "exact" })
    .eq("organization_id", organizationId)
    .neq("status", "deleted");

  query = applyEmployeeListScope(query, actor);

  const { data, count, error } = await query;
  if (error) {
    throw error;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newHires = (data || []).filter((row) => {
    if (!row.joining_date) {
      return false;
    }
    return new Date(row.joining_date) >= thirtyDaysAgo;
  }).length;

  const withManager = (data || []).filter(
    (row) => row.reporting_manager_id,
  ).length;

  return {
    totalEmployees: count ?? 0,
    activeEmployees: (data || []).filter((row) => row.status === "active").length,
    newHires30d: newHires,
    withReportingManager: withManager,
    pendingReviews: (data || []).filter((row) => row.status === "pending").length,
  };
}

async function validateManagerAssignment(employeeId, managerId) {
  if (await wouldCreateReportingCycle(supabase, employeeId, managerId)) {
    const error = new Error(
      "Invalid reporting hierarchy: circular manager assignment detected.",
    );
    error.statusCode = 400;
    throw error;
  }
}

export async function createEmployeeRecord(actor, payload) {
  const organizationId = await resolveOrganizationId(actor);
  const {
    email,
    fullName,
    phone,
    departmentId,
    roleId,
    branchId,
    reportingManagerId,
    designation,
    joiningDate,
    employeeCode,
    profilePhoto,
    status = "pending",
  } = payload;

  await validateManagerAssignment(null, reportingManagerId);

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
    });

  if (authError) {
    throw authError;
  }

  const code = employeeCode || generateEmployeeCode();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        avatar_url: profilePhoto || null,
        employee_code: code,
        designation: designation || null,
        joining_date: joiningDate || null,
        organization_id: organizationId,
        department_id: departmentId || null,
        branch_id: branchId || null,
        role_id: roleId || null,
        reporting_manager_id: reportingManagerId || null,
        status,
        force_password_change: true,
        created_by: actor.id,
        metadata: buildWorkflowMetadata(),
      },
    ])
    .select(EMPLOYEE_PROFILE_SELECT)
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => null);
    throw profileError;
  }

  await logAudit(actor, "employee_created", profile.id, null, profile);

  return mapEmployeeRecord(profile);
}

export async function updateEmployeeRecord(actor, employeeId, payload) {
  const existing = await getEmployeeById(actor, employeeId);
  if (!existing && !canManageAllEmployees(actor)) {
    const error = new Error("Employee not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  const { data: oldRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", employeeId)
    .maybeSingle();

  if (!oldRow) {
    const error = new Error("Employee not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!canManageAllEmployees(actor) && oldRow.reporting_manager_id !== actor.id) {
    const error = new Error("You cannot modify this employee record.");
    error.statusCode = 403;
    throw error;
  }

  const managerId =
    payload.reportingManagerId !== undefined
      ? payload.reportingManagerId
      : oldRow.reporting_manager_id;

  await validateManagerAssignment(employeeId, managerId);

  const updatePayload = {
    full_name: payload.fullName ?? oldRow.full_name,
    phone: payload.phone ?? oldRow.phone,
    avatar_url: payload.profilePhoto ?? oldRow.avatar_url,
    designation: payload.designation ?? oldRow.designation,
    joining_date: payload.joiningDate ?? oldRow.joining_date,
    employee_code: payload.employeeCode ?? oldRow.employee_code,
    department_id: payload.departmentId ?? oldRow.department_id,
    branch_id: payload.branchId ?? oldRow.branch_id,
    role_id: payload.roleId ?? oldRow.role_id,
    reporting_manager_id: managerId,
    status: payload.status ?? oldRow.status,
    metadata: buildWorkflowMetadata(oldRow.metadata || {}, payload.metadata || {}),
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", employeeId)
    .select(EMPLOYEE_PROFILE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  await logAudit(actor, "employee_updated", employeeId, oldRow, profile);

  return mapEmployeeRecord(profile);
}

export async function changeEmployeeStatusRecord(actor, employeeId, status) {
  return updateEmployeeRecord(actor, employeeId, { status });
}

export async function toggleAccountLockRecord(actor, employeeId, isLocked) {
  const lockTime = isLocked
    ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_locked: isLocked,
      locked_until: lockTime,
      failed_login_attempts: 0,
    })
    .eq("id", employeeId)
    .select(EMPLOYEE_PROFILE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapEmployeeRecord(data);
}

async function logAudit(actor, action, resourceId, oldValues, newValues) {
  await supabase.from("audit_logs").insert([
    {
      organization_id: actor.organization_id,
      user_id: actor.id,
      action,
      resource_type: "profile",
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      created_at: new Date().toISOString(),
    },
  ]);
}
