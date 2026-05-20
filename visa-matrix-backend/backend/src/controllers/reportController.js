import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  getApplicationsByCountryReport,
  getApprovalRateReport,
  getRevenueReport,
} from "../services/reportService.js";

export const getApplicationsByCountryReportHandler = asyncHandler(
  async (_req, res) => {
    const data = await getApplicationsByCountryReport();
    return sendSuccess(res, data);
  }
);

export const getRevenueReportHandler = asyncHandler(async (_req, res) => {
  const data = await getRevenueReport();
  return sendSuccess(res, data);
});

export const getApprovalRateReportHandler = asyncHandler(async (_req, res) => {
  const data = await getApprovalRateReport();
  return sendSuccess(res, data);
});
