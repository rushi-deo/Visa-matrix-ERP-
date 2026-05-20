import { authorizeRoles as rbacAuthorizeRoles } from "./rbac.middleware.js";

// Backward compatibility wrapper - delegates to new RBAC middleware
export const authorizeRoles = (...allowedRoles) => {
  return rbacAuthorizeRoles(...allowedRoles);
};

export default authorizeRoles;
