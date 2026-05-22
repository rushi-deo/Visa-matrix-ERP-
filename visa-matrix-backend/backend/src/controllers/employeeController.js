/**
 * Employee/User Management Controller
 * Handles user creation, updates, status changes, etc.
 */

import supabase from "../config/supabase.js";

/**
 * Get all employees
 */
export async function getEmployees(req, res) {
  try {
    const { page = 1, limit = 20, role, department, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        status,
        last_login_at,
        is_locked,
        roles:role_id (id, name),
        departments:department_id (id, name)
      `,
        { count: "exact" }
      )
      .neq("id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq("roles.name", role);
    }

    if (department) {
      query = query.eq("departments.id", department);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit),
    });
  } catch (error) {
    console.error("Get employees error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get single employee
 */
export async function getEmployee(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        roles:role_id (id, name),
        departments:department_id (id, name),
        user_roles (id, role:role_id (id, name))
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get employee error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Create new employee
 */
export async function createEmployee(req, res) {
  try {
    const { email, fullName, departmentId, roleId, reportingManagerId } =
      req.body;

    if (!email || !fullName) {
      return res.status(400).json({
        success: false,
        error: "Email and full name are required",
      });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Temporary password
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          organization_id: req.user.organization_id,
          department_id: departmentId,
          role_id: roleId,
          reporting_manager_id: reportingManagerId,
          status: "pending",
          force_password_change: true,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (profileError) {
      // Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Log audit
    await supabase.from("audit_logs").insert([
      {
        organization_id: req.user.organization_id,
        user_id: req.user.id,
        action: "employee_created",
        resource_type: "profile",
        resource_id: profile.id,
        new_values: profile,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.status(201).json({
      success: true,
      data: profile,
      message: "Employee created successfully",
    });
  } catch (error) {
    console.error("Create employee error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update employee
 */
export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { fullName, departmentId, roleId, reportingManagerId, status } =
      req.body;

    // Get current data for audit
    const { data: oldData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    // Update profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        department_id: departmentId,
        role_id: roleId,
        reporting_manager_id: reportingManagerId,
        status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from("audit_logs").insert([
      {
        organization_id: req.user.organization_id,
        user_id: req.user.id,
        action: "employee_updated",
        resource_type: "profile",
        resource_id: id,
        old_values: oldData,
        new_values: profile,
        created_at: new Date().toISOString(),
      },
    ]);

    return res.status(200).json({
      success: true,
      data: profile,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Update employee error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Change employee status
 */
export async function changeEmployeeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "active", "suspended", "inactive", "deleted"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log audit
    await supabase.from("audit_logs").insert([
      {
        organization_id: req.user.organization_id,
        user_id: req.user.id,
        action: "employee_status_changed",
        resource_type: "profile",
        resource_id: id,
        new_values: { status },
        created_at: new Date().toISOString(),
      },
    ]);

    return res.status(200).json({
      success: true,
      data: profile,
      message: "Employee status changed successfully",
    });
  } catch (error) {
    console.error("Change employee status error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Assign role to employee
 */
export async function assignRole(req, res) {
  try {
    const { userId, roleId } = req.body;

    // Check if already assigned
    const { data: existing } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Role already assigned to this user",
      });
    }

    const { data, error } = await supabase
      .from("user_roles")
      .insert([
        {
          user_id: userId,
          role_id: roleId,
          assigned_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update primary role in profiles
    await supabase
      .from("profiles")
      .update({ role_id: roleId })
      .eq("id", userId);

    return res.status(201).json({
      success: true,
      data,
      message: "Role assigned successfully",
    });
  } catch (error) {
    console.error("Assign role error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Lock/Unlock account
 */
export async function toggleAccountLock(req, res) {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    const lockTime = isLocked ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_locked: isLocked,
        locked_until: lockTime,
        failed_login_attempts: 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
      message: `Account ${isLocked ? "locked" : "unlocked"} successfully`,
    });
  } catch (error) {
    console.error("Toggle account lock error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get employee permissions
 */
export async function getEmployeePermissions(req, res) {
  try {
    const { userId } = req.params;

    // Get direct permissions
    const { data: directPerms, error: directError } = await supabase
      .from("employee_permissions")
      .select("permissions(id, name, description, module, action)")
      .eq("employee_id", userId)
      .gt("expires_at", new Date().toISOString());

    if (directError) throw directError;

    // Get role permissions
    const { data: rolePerms, error: roleError } = await supabase
      .from("role_permissions")
      .select("permissions(id, name, description, module, action)")
      .eq("role_id", (await supabase.from("profiles").select("role_id").eq("id", userId).single()).data.role_id);

    if (roleError) throw roleError;

    const permissions = [
      ...new Map(
        [
          ...directPerms.map((p) => [p.permissions.id, p.permissions]),
          ...rolePerms.map((p) => [p.permissions.id, p.permissions]),
        ].map((p) => [p[0], p[1]])
      ).values(),
    ];

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Get employee permissions error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
