import { createCrudRepository } from "../../core/baseRepository.js";

const taskCrudRepository = createCrudRepository({
  tableName: "tasks",
});

export const listTasks = (query = {}) => {
  return taskCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      application_id: query.applicationId,
      assigned_to: query.assignedTo,
      status: query.status,
    },
    searchTerm: query.search,
    searchColumns: ["title", "task_title", "description", "task_description"],
  });
};

export const getTaskById = (id) => taskCrudRepository.findById(id);
export const createTask = (payload) => taskCrudRepository.create(payload);
export const updateTask = (id, payload) => taskCrudRepository.update(id, payload);
export const deleteTask = (id) => taskCrudRepository.remove(id);
