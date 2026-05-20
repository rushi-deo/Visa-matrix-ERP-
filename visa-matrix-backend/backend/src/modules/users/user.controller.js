import { asyncHandler } from "../../core/errors.js";
import { sendSuccess } from "../../core/response.js";
import { getUserById, getUsers, updateUser } from "./user.service.js";

export const listUsersController = asyncHandler(async (req, res) => {
  const data = await getUsers(req.query);
  return sendSuccess(res, data);
});

export const getUserByIdController = asyncHandler(async (req, res) => {
  const data = await getUserById(req.params.id, req.auth);
  return sendSuccess(res, data);
});

export const updateUserController = asyncHandler(async (req, res) => {
  const data = await updateUser(req.params.id, req.body, req.auth);
  return sendSuccess(res, data, {
    message: "User updated successfully.",
  });
});
