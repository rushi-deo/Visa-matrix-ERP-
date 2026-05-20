import { authenticateToken } from "./rbac.middleware.js";

// Backward compatibility wrapper - delegates to new RBAC middleware
export default authenticateToken;
