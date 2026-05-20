import { asyncHandler } from "../../core/errors.js";
import { sendCreated, sendSuccess } from "../../core/response.js";
import {
  createTaskRecord,
  deleteTaskRecord,
  getTask,
  getTasks,
  updateTaskRecord,
} from "./task.service.js";

export const listTasksController = asyncHandler(async (req, res) => {
  const data = await getTasks(req.query);
  return sendSuccess(res, data);
});

export const getTaskByIdController = asyncHandler(async (req, res) => {
  const data = await getTask(req.params.id);
  return sendSuccess(res, data);
});

export const createTaskController = asyncHandler(async (req, res) => {
  const data = await createTaskRecord(req.body);
  return sendCreated(res, data, "Task created successfully.");
});

export const updateTaskController = asyncHandler(async (req, res) => {
  const data = await updateTaskRecord(req.params.id, req.body);
  return sendSuccess(res, data, {
    message: "Task updated successfully.",
  });
});

export const deleteTaskController = asyncHandler(async (req, res) => {
  const data = await deleteTaskRecord(req.params.id);
  return sendSuccess(res, data, {
    message: "Task deleted successfully.",
  });
});
