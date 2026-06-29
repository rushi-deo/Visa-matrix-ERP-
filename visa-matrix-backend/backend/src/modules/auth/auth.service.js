import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors.js";
import {
  createAuthUser,
  createUserProfile,
  deleteAuthUser,
  findUserProfileByEmail,
  findUserProfileById,
  signInWithPassword,
} from "./auth.repository.js";
import { getUserRole, getRoleByName } from "../admin/role.repository.js";
import { getRolePermissionNames } from "../admin/permission.repository.js";
import {
  isGuestRole,
  normalizeEnterpriseRole,
} from "../../config/rbac.js";

const signToken = async (user) => {
  try {
    // Fetch role from user_roles table
    let userRole = user.role || "Employee";
    let permissions = [];

    const roleFromDb = await getUserRole(user.id);
    if (roleFromDb) {
      userRole = roleFromDb;
    }

    // Fetch permissions for the role
    if (userRole) {
      const roleData = await getRoleByName(userRole);
      if (roleData?.id) {
        permissions = await getRolePermissionNames(roleData.id);
      }
    }

    userRole = normalizeEnterpriseRole(userRole);

    if (userRole === "Super Admin") {
      permissions = ["*"];
    }

    return jwt.sign(
      {
        sub: user.id,
        userId: user.id,
        authUserId: user.user_id || null,
        email: user.email,
        role: userRole,
        permissions: permissions,
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn,
      },
    );
  } catch (error) {
    console.error("Error signing token:", error);
    // Fallback token without permissions
    return jwt.sign(
      {
        sub: user.id,
        userId: user.id,
        authUserId: user.user_id || null,
        email: user.email,
        role: normalizeEnterpriseRole(user.role) || "Employee",
        permissions: [],
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn,
      },
    );
  }
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const {
    password: _password,
    encrypted_password: _encrypted_password,
    email_change_token_new: _email_change_token_new,
    ...safeUser
  } = user;

  return {
    ...safeUser,
    organization_id: safeUser.organization_id || null,
  };
};

export const register = async (payload) => {
  if (payload.role === "admin") {
    throw new ForbiddenError(
      "Admin accounts must be provisioned by an existing administrator.",
    );
  }

  const existingUser = await findUserProfileByEmail(payload.email);

  if (existingUser) {
    throw new ConflictError("A user with this email already exists.");
  }

  const authUser = await createAuthUser({
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName,
    role: payload.role,
  });

  try {
    const userProfile = await createUserProfile({
      authUserId: authUser.id,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
    });

    const token = await signToken(userProfile);

    return {
      token,
      user: sanitizeUser(userProfile),
    };
  } catch (error) {
    await deleteAuthUser(authUser.id).catch(() => null);
    throw error;
  }
};

export const login = async (payload) => {
  const session = await signInWithPassword(payload);
  const userProfile = await findUserProfileByEmail(payload.email);

  if (!userProfile) {
    throw new NotFoundError("User profile not found.");
  }

  if (isGuestRole(normalizeEnterpriseRole(userProfile.role))) {
    throw new ForbiddenError("Guest accounts cannot access the employee portal.");
  }

  const token = await signToken(userProfile);

  return {
    token,
    user: sanitizeUser(userProfile),
    session: {
      providerToken: session.session?.provider_token || null,
      accessToken: session.session?.access_token || null,
      refreshToken: session.session?.refresh_token || null,
      expiresAt: session.session?.expires_at || null,
    },
  };
};

export const logout = async () => {
  return {
    loggedOut: true,
  };
};

export const getCurrentUser = async (authContext) => {
  const userProfile = await findUserProfileById(authContext.userId).catch(
    () => null,
  );

  if (!userProfile && !authContext.email) {
    throw new NotFoundError("Authenticated user profile not found.");
  }

  return sanitizeUser({
    ...(userProfile || {
      id: authContext.userId,
      user_id: authContext.authUserId || null,
      email: authContext.email,
      role: authContext.role,
    }),
    organization_id:
      userProfile?.organization_id || authContext.organization_id || null,
  });
};
