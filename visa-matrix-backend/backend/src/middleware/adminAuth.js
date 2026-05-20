import { authenticateAdminToken } from "../services/authService.js";
import { sendError } from "../utils/response.js";
import { getDevAdminUser, isDevelopmentMode } from "../utils/devAdmin.js";

export const adminAuth = async (req, res, next) => {
  if (isDevelopmentMode()) {
    const devAdminUser = getDevAdminUser();

    req.admin = devAdminUser;
    req.user = devAdminUser;
    req.adminToken = {
      sub: devAdminUser.id,
      email: devAdminUser.email,
      role: devAdminUser.role,
      type: "admin",
    };

    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Admin authorization token is required.", 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const { adminUser, tokenPayload } = await authenticateAdminToken(token);

    req.admin = adminUser;
    req.user = adminUser;
    req.adminToken = tokenPayload;

    return next();
  } catch (error) {
    if (error.statusCode === 401) {
      return sendError(res, error.message, 401);
    }

    return next(error);
  }
};

export default adminAuth;
