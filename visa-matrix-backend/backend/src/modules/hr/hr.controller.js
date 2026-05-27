import { asyncHandler } from "../../core/errors.js";
import { sendSuccess, sendCreated } from "../../core/response.js";
import * as service from "./hr.service.js";

export const listEmployeesController = asyncHandler(async (req, res) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
    search: req.query.search,
    department: req.query.department,
    status: req.query.status,
    organization_id: req.user?.organization_id,
  };

  const data = await service.listEmployees(query);
  return sendSuccess(res, data);
});

export const getEmployeeByIdController = asyncHandler(async (req, res) => {
  const data = await service.getEmployee(req.params.id);
  return sendSuccess(res, data);
});

export const getEmployeeProfileController = asyncHandler(async (req, res) => {
  const data = await service.getEmployeeProfile(req.params.id);
  return sendSuccess(res, data);
});

export const createEmployeeController = asyncHandler(async (req, res) => {
  const data = await service.createEmployeeProfile(req.body);
  return sendCreated(res, data, "Employee created successfully.");
});

export const updateEmployeeController = asyncHandler(async (req, res) => {
  const data = await service.updateEmployeeProfile(req.params.id, req.body);
  return sendSuccess(res, data, { message: "Employee updated successfully." });
});

export const deleteEmployeeController = asyncHandler(async (req, res) => {
  const data = await service.deleteEmployeeProfile(req.params.id);
  return sendSuccess(res, data, { message: "Employee deleted." });
});

// Departments
export const listDepartmentsController = asyncHandler(async (req, res) => {
  const data = await service.listDepartments(req.user?.organization_id);
  return sendSuccess(res, data);
});

export const createDepartmentController = asyncHandler(async (req, res) => {
  const data = await service.createDepartment(req.body);
  return sendCreated(res, data, "Department created.");
});

export const updateDepartmentController = asyncHandler(async (req, res) => {
  const data = await service.updateDepartment(req.params.id, req.body);
  return sendSuccess(res, data, { message: "Department updated." });
});

export const deleteDepartmentController = asyncHandler(async (req, res) => {
  const data = await service.deleteDepartment(req.params.id);
  return sendSuccess(res, data, { message: "Department deleted." });
});

// Designations
export const listDesignationsController = asyncHandler(async (req, res) => {
  const data = await service.listDesignations(req.query.department_id);
  return sendSuccess(res, data);
});

export const createDesignationController = asyncHandler(async (req, res) => {
  const data = await service.createDesignation(req.body);
  return sendCreated(res, data, "Designation created.");
});
