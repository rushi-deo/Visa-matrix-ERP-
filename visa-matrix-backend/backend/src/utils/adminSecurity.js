import "../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getAdminJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "Missing JWT_SECRET or ADMIN_JWT_SECRET environment variable."
    );
  }

  return jwtSecret;
};

export const hashAdminPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const compareAdminPassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

export const signAdminToken = (adminUser) => {
  return jwt.sign(
    {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      type: "admin",
    },
    getAdminJwtSecret(),
    {
      expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "8h",
    }
  );
};

export const verifyAdminToken = (token) => {
  return jwt.verify(token, getAdminJwtSecret());
};

export const getSafeAdminUser = (adminUser) => {
  if (!adminUser) {
    return null;
  }

  const { password_hash, password, ...safeAdminUser } = adminUser;
  return safeAdminUser;
};
