import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from "./task.repository.js";

export const getTasks = async (query) => listTasks(query);
export const getTask = async (id) => getTaskById(id);
export const createTaskRecord = async (payload) => {
  const nextPayload =
    payload.status || payload.task_status
      ? payload
      : {
          ...payload,
          status: "open",
        };

  return createTask(nextPayload);
};
export const updateTaskRecord = async (id, payload) => updateTask(id, payload);
export const deleteTaskRecord = async (id) => deleteTask(id);
