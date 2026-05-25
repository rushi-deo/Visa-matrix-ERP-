/**
 * Employee Management Routes
 */

import { Router } from "express";
import { z } from "zod";
import { requestValidator } from "../middleware/requestValidator.js";
import authenticateToken, {
  requireRole,
  requireSuperAdmin,
} from "../middleware/authenticationMiddleware.js";
import {
  getEmployees,
  getEmployee,
  getEmployeeOptions,
  getHrDashboard,
  createEmployee,
  updateEmployee,
  changeEmployeeStatus,
  assignRole,
  toggleAccountLock,
  getEmployeePermissions,
} from "../controllers/employeeController.js";

const router = Router();

const HR_MANAGE_ROLES = ["Super Admin", "Admin", "HR Manager"];

const createEmployeeSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  roleId: z.string().uuid().optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  reportingManagerId: z.string().uuid().optional().nullable(),
  designation: z.string().max(120).optional(),
  joiningDate: z.string().date().optional(),
  employeeCode: z.string().max(40).optional(),
  profilePhoto: z.string().url().optional(),
  status: z
    .enum(["pending", "active", "suspended", "inactive"])
    .optional(),
});

const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(30).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  roleId: z.string().uuid().optional().nullable(),
  branchId: z.string().uuid().optional().nullable(),
  reportingManagerId: z.string().uuid().optional().nullable(),
  designation: z.string().max(120).optional().nullable(),
  joiningDate: z.string().date().optional().nullable(),
  employeeCode: z.string().max(40).optional(),
  profilePhoto: z.string().url().optional().nullable(),
  status: z.enum(["pending", "active", "suspended", "inactive"]).optional(),
});

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

router.use(authenticateToken);

router.get(
  "/dashboard",
  requireRole(...HR_MANAGE_ROLES),
  getHrDashboard,
);

router.get(
  "/options",
  requireRole(...HR_MANAGE_ROLES),
  getEmployeeOptions,
);

router.get(
  "/",
  requireRole(...HR_MANAGE_ROLES, "Visa Officer", "Finance Manager", "Employee"),
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

router.get(
  "/:id",
  requireRole(...HR_MANAGE_ROLES, "Visa Officer", "Finance Manager", "Employee"),
  getEmployee,
);

router.post(
  "/",
  requireRole(...HR_MANAGE_ROLES),
  requestValidator({ body: createEmployeeSchema }),
  createEmployee,
);

router.patch(
  "/:id",
  requireRole(...HR_MANAGE_ROLES),
  requestValidator({ body: updateEmployeeSchema }),
  updateEmployee,
);

router.patch(
  "/:id/status",
  requireRole(...HR_MANAGE_ROLES),
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
  requireRole(...HR_MANAGE_ROLES),
  requestValidator({
    body: z.object({
      isLocked: z.boolean(),
    }),
  }),
  toggleAccountLock,
);

router.get(
  "/:userId/permissions",
  requireRole(...HR_MANAGE_ROLES),
  getEmployeePermissions,
);

export default router;
