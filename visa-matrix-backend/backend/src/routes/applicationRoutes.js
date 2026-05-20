import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import {
  createApplicationHandler,
  deleteApplicationHandler,
  getApplicationByIdHandler,
  getApplications,
  updateApplicationHandler,
} from "../controllers/applicationController.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("applications", "view"),
  getApplications
);
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("applications", "view"),
  getApplicationByIdHandler
);
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("applications", "create"),
  createApplicationHandler
);
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("applications", "edit"),
  updateApplicationHandler
);
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("applications", "delete"),
  deleteApplicationHandler
);

export default router;
