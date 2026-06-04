import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  listDepartments,
  updateDepartment,
} from "./department.repository.js";

export const getDepartments = async (query) => listDepartments(query);
export const getDepartment = async (id) => getDepartmentById(id);
export const createDepartmentRecord = async (payload) =>
  createDepartment(payload);
export const updateDepartmentRecord = async (id, payload) =>
  updateDepartment(id, payload);
export const deleteDepartmentRecord = async (id) => deleteDepartment(id);

export default {
  getDepartments,
  getDepartment,
  createDepartmentRecord,
  updateDepartmentRecord,
  deleteDepartmentRecord,
};
