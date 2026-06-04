import { Router } from "express";
import {
  createVisaTypeHandler,
  deleteVisaTypeHandler,
  getVisaTypeByIdHandler,
  getVisaTypes,
  updateVisaTypeHandler,
} from "../controllers/visaTypeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = Router();

// Public read endpoints
router.get("/", getVisaTypes);
router.get("/:id", getVisaTypeByIdHandler);

// Protected write endpoints (authenticate + RBAC permission)
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("visa_types", "create"),
  createVisaTypeHandler,
);

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("visa_types", "edit"),
  updateVisaTypeHandler,
);

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("visa_types", "delete"),
  deleteVisaTypeHandler,
);

export default router;
