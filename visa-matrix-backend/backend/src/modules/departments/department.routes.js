import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import {
  createDepartmentController,
  deleteDepartmentController,
  getDepartmentByIdController,
  listDepartmentsController,
  updateDepartmentController,
} from "./department.controller.js";

const router = Router();

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});

const bodySchema = z
  .object({
    name: z.string().min(2).max(150),
    code: z.string().max(40).optional(),
    address: z.string().max(400).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .passthrough();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("departments", "view"),
  requestValidator({ query: querySchema }),
  listDepartmentsController,
);

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("departments", "view"),
  requestValidator({ params: paramsSchema }),
  getDepartmentByIdController,
);

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("departments", "create"),
  requestValidator({ body: bodySchema }),
  createDepartmentController,
);

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("departments", "edit"),
  requestValidator({ params: paramsSchema, body: bodySchema }),
  updateDepartmentController,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("departments", "delete"),
  requestValidator({ params: paramsSchema }),
  deleteDepartmentController,
);

export default router;
