import { authenticateToken } from "./rbac.middleware.js";

// Backward compatibility wrapper
export const authMiddleware = authenticateToken;

export default authMiddleware;
