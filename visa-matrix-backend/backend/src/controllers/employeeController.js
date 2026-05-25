/**
 * Employee Management Controller — delegates to employeeService.
 */

import * as employeeService from "../services/employeeService.js";

function sendError(res, error, fallbackStatus = 500) {
  return res.status(error.statusCode || fallbackStatus).json({
    success: false,
    error: error.message,
  });
}

export async function getEmployees(req, res) {
  try {
    const result = await employeeService.listEmployees(req.user, req.query);
    return res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    return sendError(res, error);
  }
}

export async function getEmployee(req, res) {
  try {
    const employee = await employeeService.getEmployeeById(
      req.user,
      req.params.id,
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);
    return sendError(res, error);
  }
}

export async function getEmployeeOptions(req, res) {
  try {
    const options = await employeeService.getEmployeeFormOptions(req.user);
    return res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Get employee options error:", error);
    return sendError(res, error);
  }
}

export async function getHrDashboard(req, res) {
  try {
    const summary = await employeeService.getHrDashboardSummary(req.user);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("HR dashboard error:", error);
    return sendError(res, error);
  }
}

export async function createEmployee(req, res) {
  try {
    const employee = await employeeService.createEmployeeRecord(
      req.user,
      req.body,
    );
    return res.status(201).json({
      success: true,
      data: employee,
      message: "Employee created successfully",
    });
  } catch (error) {
    console.error("Create employee error:", error);
    return sendError(res, error);
  }
}

export async function updateEmployee(req, res) {
  try {
    const employee = await employeeService.updateEmployeeRecord(
      req.user,
      req.params.id,
      req.body,
    );
    return res.status(200).json({
      success: true,
      data: employee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Update employee error:", error);
    return sendError(res, error);
  }
}

export async function changeEmployeeStatus(req, res) {
  try {
    const employee = await employeeService.changeEmployeeStatusRecord(
      req.user,
      req.params.id,
      req.body.status,
    );
    return res.status(200).json({
      success: true,
      data: employee,
      message: "Employee status changed successfully",
    });
  } catch (error) {
    console.error("Change employee status error:", error);
    return sendError(res, error);
  }
}

export async function toggleAccountLock(req, res) {
  try {
    const employee = await employeeService.toggleAccountLockRecord(
      req.user,
      req.params.id,
      req.body.isLocked,
    );
    return res.status(200).json({
      success: true,
      data: employee,
      message: `Account ${req.body.isLocked ? "locked" : "unlocked"} successfully`,
    });
  } catch (error) {
    console.error("Toggle account lock error:", error);
    return sendError(res, error);
  }
}

export async function assignRole(req, res) {
  try {
    const { userId, roleId } = req.body;
    const employee = await employeeService.updateEmployeeRecord(req.user, userId, {
      roleId,
    });
    return res.status(201).json({
      success: true,
      data: employee,
      message: "Role assigned successfully",
    });
  } catch (error) {
    console.error("Assign role error:", error);
    return sendError(res, error);
  }
}

export async function getEmployeePermissions(req, res) {
  try {
    const { userId } = req.params;
    const { default: supabase } = await import("../config/supabase.js");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("id", userId)
      .maybeSingle();

    const { data: directPerms } = await supabase
      .from("employee_permissions")
      .select("permissions(id, name, description, module, action)")
      .eq("employee_id", userId);

    let rolePerms = [];
    if (profile?.role_id) {
      const { data } = await supabase
        .from("role_permissions")
        .select("permissions(id, name, description, module, action)")
        .eq("role_id", profile.role_id);
      rolePerms = data || [];
    }

    const permissions = [
      ...new Map(
        [...(directPerms || []), ...rolePerms].map((row) => [
          row.permissions?.id,
          row.permissions,
        ]),
      ).values(),
    ].filter(Boolean);

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Get employee permissions error:", error);
    return sendError(res, error);
  }
}
