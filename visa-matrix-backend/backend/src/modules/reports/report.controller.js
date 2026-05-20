import { asyncHandler } from "../../core/errors.js";
import { sendSuccess } from "../../core/response.js";
import {
  getAgentsReport,
  getApplicationsReport,
  getRevenueReport,
} from "./report.service.js";

export const applicationsReportController = asyncHandler(async (_req, res) => {
  const data = await getApplicationsReport();
  return sendSuccess(res, data);
});

export const revenueReportController = asyncHandler(async (_req, res) => {
  const data = await getRevenueReport();
  return sendSuccess(res, data);
});

export const agentsReportController = asyncHandler(async (_req, res) => {
  const data = await getAgentsReport();
  return sendSuccess(res, data);
});
