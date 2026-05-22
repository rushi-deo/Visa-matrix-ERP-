/**
 * Employee Management Routes
 */

import { Router } from "express";
import { z } from "zod";
import { requestValidator } from "../middleware/requestValidator.js";
import authenticateToken, {
  requireRole,
  requirePermission,
  requireSuperAdmin,
} from "../middleware/authenticationMiddleware.js";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  changeEmployeeStatus,
  assignRole,
  toggleAccountLock,
  getEmployeePermissions,
} from "../controllers/employeeController.js";

const router = Router();

// Schemas
const createEmployeeSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  departmentId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  reportingManagerId: z.string().uuid().optional(),
});

const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  departmentId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  reportingManagerId: z.string().uuid().optional(),
  status: z.enum(["pending", "active", "suspended", "inactive"]).optional(),
});

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

// Middleware
router.use(authenticateToken);

// Routes
router.get(
  "/",
  requestValidator({
    query: z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      role: z.string().optional(),
      department: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }),
  }),
  getEmployees,
);

router.get("/:id", getEmployee);

router.post(
  "/",
  requireRole("Super Admin", "Admin"),
  requestValidator({ body: createEmployeeSchema }),
  createEmployee,
);

router.patch(
  "/:id",
  requireRole("Super Admin", "Admin"),
  requestValidator({ body: updateEmployeeSchema }),
  updateEmployee,
);

router.patch(
  "/:id/status",
  requireRole("Super Admin", "Admin"),
  requestValidator({
    body: z.object({
      status: z.enum(["pending", "active", "suspended", "inactive"]),
    }),
  }),
  changeEmployeeStatus,
);

router.post(
  "/assign-role",
  requireSuperAdmin,
  requestValidator({ body: assignRoleSchema }),
  assignRole,
);

router.patch(
  "/:id/lock",
  requireRole("Super Admin", "Admin"),
  requestValidator({
    body: z.object({
      isLocked: z.boolean(),
    }),
  }),
  toggleAccountLock,
);

router.get("/:userId/permissions", getEmployeePermissions);

export default router;
