import { ForbiddenError, NotFoundError } from "../../core/errors.js";
import { listUsers, findUserById, updateUserById } from "./user.repository.js";

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, encrypted_password, ...safeUser } = user;
  return safeUser;
};

export const getUsers = async (query) => {
  const result = await listUsers(query);

  return {
    ...result,
    items: result.items.map(sanitizeUser),
  };
};

export const getUserById = async (userId, authContext) => {
  if (authContext.role !== "admin" && authContext.userId !== userId) {
    throw new ForbiddenError("You can only view your own profile.");
  }

  const user = await findUserById(userId);
  return sanitizeUser(user);
};

export const updateUser = async (userId, payload, authContext) => {
  if (authContext.role !== "admin" && authContext.userId !== userId) {
    throw new ForbiddenError("You can only update your own profile.");
  }

  const existingUser = await findUserById(userId).catch(() => null);

  if (!existingUser) {
    throw new NotFoundError("User not found.");
  }

  const nextPayload =
    authContext.role === "admin"
      ? payload
      : Object.fromEntries(
          Object.entries(payload).filter(([key]) =>
            ["full_name", "phone", "avatar_url", "timezone"].includes(key)
          )
        );

  const updatedUser = await updateUserById(userId, nextPayload);
  return sanitizeUser(updatedUser);
};
