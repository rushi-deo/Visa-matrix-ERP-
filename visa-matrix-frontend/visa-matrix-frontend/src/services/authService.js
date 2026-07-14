import apiClient, { extractResponseData } from "./apiClient";

function normalizeAuthPayload(response) {
  const payload = extractResponseData(response);
  const token = payload?.token;
  const userPayload = payload?.user;
  const user =
    userPayload && (payload?.role || payload?.permissions)
      ? {
          ...userPayload,
          role: payload.role ?? userPayload.role,
          permissions: payload.permissions ?? userPayload.permissions ?? [],
        }
      : userPayload;

  if (!token || !user) {
    throw new Error("Login response did not include a token and user.");
  }

  return { token, user, session: payload?.session ?? null };
}

export async function loginUser({ email, password }) {
  const response = await apiClient.post("/auth/login", { email, password });
  return normalizeAuthPayload(response);
}

export async function registerUser({ email, password, fullName, phone, role }) {
  const response = await apiClient.post("/auth/register", {
    email,
    password,
    fullName,
    phone,
    role,
  });
  return normalizeAuthPayload(response);
}

export async function signInUser(credentials) {
  return loginUser(credentials);
}

export async function signUpUser(payload) {
  return registerUser(payload);
}

export async function signOutUser() {
  const response = await apiClient.post("/auth/logout");
  return extractResponseData(response);
}

export async function fetchCurrentUser() {
  const response = await apiClient.get("/auth/me");
  const payload = extractResponseData(response);

  return {
    user: payload?.user ?? payload,
    role: payload?.role ?? payload?.user?.role,
    permissions: payload?.permissions ?? payload?.user?.permissions ?? [],
  };
}

export async function requestPasswordReset({ email }) {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return extractResponseData(response);
}

export async function resetPassword({ token, password }) {
  const response = await apiClient.post("/auth/reset-password", { token, password });
  return extractResponseData(response);
}
