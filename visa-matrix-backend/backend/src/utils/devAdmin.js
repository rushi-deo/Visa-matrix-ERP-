export const DEV_ADMIN_ID = "dev-admin-id";
export const DEV_ADMIN_EMAIL = "ruushisdeo@visamatrix.in";
export const DEV_ADMIN_PASSWORD = "Ruushisdeo14$";
export const DEV_ADMIN_ROLE = "admin";

export const isDevelopmentMode = () => process.env.NODE_ENV === "development";

export const getDevAdminUser = () => ({
  id: DEV_ADMIN_ID,
  email: DEV_ADMIN_EMAIL,
  role: DEV_ADMIN_ROLE,
});
