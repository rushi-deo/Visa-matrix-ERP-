import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createDepartmentRecord,
  deleteDepartmentRecord,
  getDepartment,
  getDepartments,
  updateDepartmentRecord,
} from "./department.service.js";
import logger from "../../core/logger.js";

export const listDepartmentsController = asyncHandler(async (req, res) => {
  const data = await getDepartments(req.query);
  const items = data?.items ?? [];
  const userId = req.user?.userId ?? req.auth?.userId ?? null;
  const organizationId =
    req.user?.organization_id ?? req.auth?.organization_id ?? null;
  logger.info("Departments:list", {
    userId,
    organizationId,
    count: items.length,
  });
  return sendSuccess(res, data);
});

export const getDepartmentByIdController = asyncHandler(async (req, res) => {
  const data = await getDepartment(req.params.id);
  return sendSuccess(res, data);
});

export const createDepartmentController = asyncHandler(async (req, res) => {
  const data = await createDepartmentRecord(req.body);
  return sendCreated(res, data, "Department created successfully.");
});

export const updateDepartmentController = asyncHandler(async (req, res) => {
  const data = await updateDepartmentRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Department updated successfully.",
  });
});

export const deleteDepartmentController = asyncHandler(async (req, res) => {
  const data = await deleteDepartmentRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Department deleted successfully.",
  });
});

export default {
  listDepartmentsController,
  getDepartmentByIdController,
  createDepartmentController,
  updateDepartmentController,
  deleteDepartmentController,
};
