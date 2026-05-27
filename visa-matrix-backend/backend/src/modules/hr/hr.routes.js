import express from "express";
import { authenticateUser } from "../../middleware/auth.js";
import { authorize } from "../../middleware/rbac.js";
import { requestValidator } from "../../middleware/requestValidator.js";
import * as controller from "./hr.controller.js";
import {
  employeeQuerySchema,
  employeeBodySchema,
  employeeIdParamsSchema,
  departmentBodySchema,
  departmentIdParamsSchema,
  designationBodySchema,
} from "./hr.validators.js";

const router = express.Router();

router.use(authenticateUser);

// Employees
router.get("/employees", authorize("super_admin", "admin", "manager"), requestValidator({ query: employeeQuerySchema }), controller.listEmployeesController);
router.get("/employees/:id", authorize("super_admin", "admin", "manager"), requestValidator({ params: employeeIdParamsSchema }), controller.getEmployeeByIdController);
router.get("/employees/:id/profile", authorize("super_admin", "admin", "manager"), requestValidator({ params: employeeIdParamsSchema }), controller.getEmployeeProfileController);
router.post("/employees", authorize("super_admin", "admin", "manager"), requestValidator({ body: employeeBodySchema }), controller.createEmployeeController);
router.put("/employees/:id", authorize("super_admin", "admin", "manager"), requestValidator({ params: employeeIdParamsSchema, body: employeeBodySchema }), controller.updateEmployeeController);
router.delete("/employees/:id", authorize("super_admin", "admin"), requestValidator({ params: employeeIdParamsSchema }), controller.deleteEmployeeController);

// Departments
router.get("/departments", authorize("super_admin", "admin", "manager"), controller.listDepartmentsController);
router.post("/departments", authorize("super_admin", "admin"), requestValidator({ body: departmentBodySchema }), controller.createDepartmentController);
router.put("/departments/:id", authorize("super_admin", "admin"), requestValidator({ params: departmentIdParamsSchema, body: departmentBodySchema }), controller.updateDepartmentController);
router.delete("/departments/:id", authorize("super_admin", "admin"), requestValidator({ params: departmentIdParamsSchema }), controller.deleteDepartmentController);

// Designations
router.get("/designations", authorize("super_admin", "admin", "manager"), controller.listDesignationsController);
router.post("/designations", authorize("super_admin", "admin"), requestValidator({ body: designationBodySchema }), controller.createDesignationController);

export default router;
