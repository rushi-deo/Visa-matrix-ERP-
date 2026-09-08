import supabase from "../../config/supabase.js";
import {
  AuthenticationError,
  ConflictError,
  ExternalServiceError,
  fromSupabaseError,
  NotFoundError,
} from "../../core/errors.js";

const sanitizeProfilePayload = ({
  authUserId,
  fullName,
  email,
  phone,
  role,
}) => {
  return [
    {
      user_id: authUserId,
      full_name: fullName,
      email,
      phone,
      role,
    },
    {
      full_name: fullName,
      email,
      phone,
      role,
    },
    {
      full_name: fullName,
      email,
      role,
    },
  ];
};

export const createAuthUser = async ({ email, password, fullName, role }) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (error) {
    throw fromSupabaseError(error, "Failed to create authentication user.");
  }

  return data.user;
};

export const deleteAuthUser = async (authUserId) => {
  if (!authUserId) {
    return;
  }

  const { error } = await supabase.auth.admin.deleteUser(authUserId);

  if (error) {
    throw fromSupabaseError(error, "Failed to roll back authentication user.");
  }
};

export const signInWithPassword = async ({ email, password }) => {
  let result;

  try {
    result = await supabase.auth.signInWithPassword({ email, password });
  } catch (error) {
    // The Supabase SDK throws for transport failures (DNS, TLS, timeout),
    // rather than returning its normal { data, error } result.
    throw new ExternalServiceError(
      "Authentication service is temporarily unavailable. Please try again later.",
    );
  }

  const { data, error } = result;

  if (error) {
    // Only a credential rejection is safe to present as an invalid login.
    // Network, DNS, project, or provider configuration failures must not be
    // mistaken for a bad password.
    if (error.code === "invalid_credentials") {
      throw new AuthenticationError("Invalid email or password.");
    }

    throw new ExternalServiceError(
      "Authentication service is temporarily unavailable. Please try again later.",
    );
  }

  return data;
};

export const findUserProfileByEmail = async (email) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch user profile by email.");
  }

  if (data && data.is_active === false) {
    throw new AuthenticationError("User account is disabled.");
  }

  return data;
};

export const findUserProfileById = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch user profile.");
  }

  if (!data) {
    throw new NotFoundError("User profile not found.");
  }

  return data;
};

export const createUserProfile = async ({
  authUserId,
  fullName,
  email,
  phone,
  role,
}) => {
  const candidates = sanitizeProfilePayload({
    authUserId,
    fullName,
    email,
    phone,
    role,
  });

  let lastError = null;

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(candidate)
      .select("*")
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    if (!error && !data) {
      continue;
    }

    if (error.code === "23505") {
      throw new ConflictError("A user with this email already exists.");
    }

    if (/column/i.test(error.message || "")) {
      lastError = error;
      continue;
    }

    throw fromSupabaseError(error, "Failed to create user profile.");
  }

  console.log(
    "Failed to create user profile for email:",
    email,
    "Last error:",
    lastError,
  );
  throw fromSupabaseError(lastError, "Failed to create user profile.");
};
