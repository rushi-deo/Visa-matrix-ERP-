import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/rbac.middleware.js";

import {
  listLeadsController,
  getLeadController,
  createLeadController,
  updateLeadController,
  deleteLeadController,
} from "./lead.controller.js";

const router = Router();

router.use(authenticateUser);

router.use(
  authorizeRoles("Super Admin", "Admin", "Visa Officer"),
);

router.get("/", listLeadsController);
router.get("/:id", getLeadController);
router.post("/", createLeadController);
router.put("/:id", updateLeadController);
router.delete("/:id", deleteLeadController);

export default router;
