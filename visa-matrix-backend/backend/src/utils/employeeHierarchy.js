/**
 * Reporting hierarchy utilities — reusable for approvals, leave, escalation (future).
 */

export const EMPLOYEE_PROFILE_SELECT = `
  id,
  employee_code,
  email,
  full_name,
  phone,
  avatar_url,
  designation,
  joining_date,
  status,
  is_locked,
  last_login_at,
  created_at,
  organization_id,
  department_id,
  branch_id,
  role_id,
  reporting_manager_id,
  metadata,
  roles:role_id (id, name),
  departments:department_id (id, name),
  branches:branch_id (id, name, code),
  reporting_manager:reporting_manager_id (
    id,
    full_name,
    designation,
    employee_code,
    roles:role_id (id, name)
  )
`;

export function formatManagerLabel(manager) {
  if (!manager?.full_name) {
    return null;
  }

  const title =
    manager.designation ||
    manager.roles?.name ||
    "Manager";

  return `${manager.full_name} — ${title}`;
}

export function validateReportingAssignment(employeeId, managerId) {
  if (!managerId) {
    return { valid: true };
  }

  if (!employeeId) {
    return { valid: true };
  }

  if (employeeId === managerId) {
    return {
      valid: false,
      message: "An employee cannot report to themselves.",
    };
  }

  return { valid: true };
}

/**
 * Walks the manager chain to detect circular reporting loops.
 */
export async function wouldCreateReportingCycle(
  supabase,
  employeeId,
  managerId,
) {
  const selfCheck = validateReportingAssignment(employeeId, managerId);
  if (!selfCheck.valid) {
    return true;
  }

  if (!managerId) {
    return false;
  }

  const visited = new Set(employeeId ? [employeeId] : []);
  let currentId = managerId;

  while (currentId) {
    if (visited.has(currentId)) {
      return true;
    }

    visited.add(currentId);

    const { data, error } = await supabase
      .from("profiles")
      .select("reporting_manager_id")
      .eq("id", currentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    currentId = data?.reporting_manager_id || null;
  }

  return false;
}

export function mapEmployeeRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    employeeId: record.employee_code || null,
    email: record.email,
    fullName: record.full_name,
    phone: record.phone || null,
    profilePhoto: record.avatar_url || null,
    designation: record.designation || null,
    joiningDate: record.joining_date || null,
    employmentStatus: record.status,
    isLocked: Boolean(record.is_locked),
    lastLoginAt: record.last_login_at,
    createdAt: record.created_at,
    organizationId: record.organization_id,
    role: record.roles
      ? { id: record.roles.id, name: record.roles.name }
      : null,
    department: record.departments
      ? { id: record.departments.id, name: record.departments.name }
      : null,
    branch: record.branches
      ? {
          id: record.branches.id,
          name: record.branches.name,
          code: record.branches.code,
        }
      : null,
    reportingTo: record.reporting_manager
      ? {
          id: record.reporting_manager.id,
          fullName: record.reporting_manager.full_name,
          designation: record.reporting_manager.designation,
          employeeId: record.reporting_manager.employee_code,
          roleName: record.reporting_manager.roles?.name || null,
          label: formatManagerLabel(record.reporting_manager),
        }
      : null,
    metadata: record.metadata || {},
  };
}

export function buildWorkflowMetadata(existing = {}, patch = {}) {
  return {
    ...existing,
    workflow: {
      ...(existing?.workflow || {}),
      ...(patch.workflow || {}),
      approvalChainReady: true,
      version: 1,
    },
  };
}
