import { Router } from "express";
import {
  getApplicationsByCountryReportHandler,
  getApprovalRateReportHandler,
  getRevenueReportHandler,
} from "../controllers/reportController.js";

const router = Router();

router.get("/applications-by-country", getApplicationsByCountryReportHandler);
router.get("/revenue", getRevenueReportHandler);
router.get("/approval-rate", getApprovalRateReportHandler);

export default router;
