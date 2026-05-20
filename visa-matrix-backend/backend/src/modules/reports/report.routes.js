import { Router } from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import permissionMiddleware from "../../middleware/permissionMiddleware.js";
import {
  agentsReportController,
  applicationsReportController,
  revenueReportController,
} from "./report.controller.js";

const router = Router();

router.use(authMiddleware);
router.use(permissionMiddleware("reports", "view"));

router.get("/applications", applicationsReportController);
router.get("/revenue", revenueReportController);
router.get("/agents", agentsReportController);

export default router;
