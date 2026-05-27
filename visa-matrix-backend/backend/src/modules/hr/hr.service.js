import * as repo from "./hr.repository.js";
import { NotFoundError, RequestValidationError } from "../../core/errors.js";

const generateEmployeeCode = () => `EMP-${Date.now().toString().slice(-6)}`;

const ensureNoCircularReporting = async (employeeId, managerId) => {
  if (!managerId) return true;
  if (employeeId === managerId) {
    throw new RequestValidationError("Employee cannot report to themselves.");
  }

  // walk up the manager chain to ensure no cycles
  let current = await repo.getEmployeeById(managerId);
  const seen = new Set([employeeId]);

  while (current) {
    if (seen.has(current.id)) {
      throw new RequestValidationError("Circular reporting relationship detected.");
    }
    seen.add(current.id);
    if (!current.manager_id) break;
    if (current.manager_id === employeeId) {
      throw new RequestValidationError("Circular reporting relationship detected.");
    }
    current = await repo.getEmployeeById(current.manager_id);
  }

  return true;
};

export const listEmployees = async (query) => {
  return repo.listEmployees(query);
};

export const getEmployee = async (employeeId) => {
  const employee = await repo.getEmployeeById(employeeId);
  if (!employee) throw new NotFoundError("Employee not found.");
  return employee;
};

export const getEmployeeProfile = async (employeeId) => {
  const employee = await getEmployee(employeeId);

  // compute manager name and subordinate count
  let manager = null;
  if (employee.manager_id) {
    manager = await repo.getEmployeeById(employee.manager_id);
  }

  const subordinates = await repo.listEmployees({ department: null });
  const subordinateCount = (subordinates.items || []).filter((e) => e.manager_id === employee.id).length;

  return {
    employee,
    manager: manager ? { id: manager.id, name: manager.full_name } : null,
    subordinateCount,
  };
};

export const createEmployeeProfile = async (payload) => {
  // validate manager
  if (payload.manager_id) {
    if (payload.manager_id === payload.id) {
      throw new RequestValidationError("Employee cannot report to themselves.");
    }
    await ensureNoCircularReporting(payload.id, payload.manager_id);
  }

  if (!payload.employee_code) payload.employee_code = generateEmployeeCode();

  return repo.createEmployee(payload);
};

export const updateEmployeeProfile = async (employeeId, payload) => {
  if (payload.manager_id) {
    if (payload.manager_id === employeeId) {
      throw new RequestValidationError("Employee cannot report to themselves.");
    }
    await ensureNoCircularReporting(employeeId, payload.manager_id);
  }

  return repo.updateEmployee(employeeId, payload);
};

export const deleteEmployeeProfile = async (employeeId) => {
  await repo.deleteEmployee(employeeId);
  return { id: employeeId, deleted: true };
};

export const listDepartments = async (organization_id) => repo.listDepartments(organization_id);
export const createDepartment = async (payload) => repo.createDepartment(payload);
export const updateDepartment = async (id, payload) => repo.updateDepartment(id, payload);
export const deleteDepartment = async (id) => repo.deleteDepartment(id);

export const listDesignations = async (department_id) => repo.listDesignations(department_id);
export const createDesignation = async (payload) => repo.createDesignation(payload);
