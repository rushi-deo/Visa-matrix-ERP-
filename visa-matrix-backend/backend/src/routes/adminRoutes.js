import express from "express";
import {
  getApplicationByReference,
  getDashboardSummary,
  listApplications,
  updateApplicationStatus,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(adminAuth);

router.get("/dashboard/summary", asyncHandler(getDashboardSummary));
router.get("/applications", asyncHandler(listApplications));
router.get("/application/:reference_no", asyncHandler(getApplicationByReference));
router.patch(
  "/application/:id/status",
  asyncHandler(updateApplicationStatus)
);

export default router;
