import { createCrudRepository } from "../../core/baseRepository.js";

const departmentCrudRepository = createCrudRepository({
  tableName: "departments",
});

export const listDepartments = (query = {}) => {
  return departmentCrudRepository.list({
    page: query.page,
    limit: query.limit,
    searchTerm: query.search,
    searchColumns: ["name", "code"],
  });
};

export const getDepartmentById = (id) => departmentCrudRepository.findById(id);
export const createDepartment = (payload) =>
  departmentCrudRepository.create(payload);
export const updateDepartment = (id, payload) =>
  departmentCrudRepository.update(id, payload);
export const deleteDepartment = (id) => departmentCrudRepository.remove(id);

export default {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
