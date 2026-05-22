import { authenticateToken } from "./rbac.middleware.js";

/**
 * Authenticate User Middleware
 * Validates JWT token and attaches decoded user to req.user
 * Required for all protected routes
 */
export const authenticateUser = authenticateToken;

export default authenticateUser;

/**
 * DEPRECATED: Use authenticateToken from rbac.middleware.js instead
 * This legacy function is kept for reference but uses undefined dependencies.
 * Use: import { authenticateToken } from "./rbac.middleware.js";
 */
// export const authenticate = async (req, _res, next) => {
//   try {
//     // DEV ONLY: bypass auth for validation route
//     if (req.originalUrl.includes("/validate")) {
//       return next();
//     }
//
//     const authorizationHeader = req.headers.authorization || "";
//
//     if (!authorizationHeader.startsWith("Bearer ")) {
//       throw new AuthenticationError("Missing or invalid authorization header.");
//     }
//
//     const token = authorizationHeader.replace("Bearer ", "").trim();
//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.getUser(token);
//
//     if (error || !user) {
//       throw new AuthenticationError("Invalid or expired token.");
//     }
//
//     const currentUser = await findUserByEmail(user.email).catch(() => null);
//     const role =
//       currentUser?.role ||
//       user.user_metadata?.role ||
//       user.app_metadata?.role ||
//       "user";
//     const permissions = await loadRolePermissions(role).catch(() => []);
//
//     req.user = {
//       id: currentUser?.id || user.id,
//       email: user.email,
//       role,
//       organization_id:
//         currentUser?.organization_id ||
//         user.user_metadata?.organization_id ||
//         user.app_metadata?.organization_id ||
//         null,
//       permissions,
//       auth_user_id: user.id,
//       token,
//     };
//
//     req.auth = {
//       token,
//       sub: currentUser?.id || user.id,
//       userId: currentUser?.id || user.id,
//       authUserId: user.id,
//       email: user.email,
//       role,
//       organization_id:
//         currentUser?.organization_id ||
//         user.user_metadata?.organization_id ||
//         user.app_metadata?.organization_id ||
//         null,
//       permissions,
//       user: currentUser,
//     };
//
//     next();
//   } catch (error) {
//     next(
//       error instanceof AuthenticationError
//         ? error
//         : new AuthenticationError("Invalid or expired token.")
//     );
//   }
// };
