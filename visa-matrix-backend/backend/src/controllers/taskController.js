import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../services/taskService.js";
import {
  validateIdParam,
  validateTaskPayload,
} from "../validators/moduleValidators.js";

export const getTasks = asyncHandler(async (req, res) => {
  const data = await listTasks(req.query);
  return sendSuccess(res, data);
});

export const createTaskHandler = asyncHandler(async (req, res) => {
  const payload = validateTaskPayload(req.body);
  const data = await createTask(payload);
  return sendSuccess(res, data, 201);
});

export const updateTaskHandler = asyncHandler(async (req, res) => {
  validateIdParam(req.params.id);
  const payload = validateTaskPayload(req.body, { partial: true });
  const data = await updateTask(req.params.id, payload);
  return sendSuccess(res, data);
});

export const deleteTaskHandler = asyncHandler(async (req, res) => {
  validateIdParam(req.params.id);
  const data = await deleteTask(req.params.id);
  return sendSuccess(res, data);
});
