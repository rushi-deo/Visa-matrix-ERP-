import {
  getApplicationByReference as getApplicationByReferenceService,
  listApplications as listApplicationsService,
  updateApplicationStatus as updateApplicationStatusService,
} from "../services/applicationService.js";
import { getDashboardSummary as getDashboardSummaryService } from "../services/dashboardService.js";
import { APPLICATION_STATUSES } from "../utils/adminConstants.js";
import { getPagination } from "../utils/pagination.js";
import { sendError } from "../utils/response.js";

export const getDashboardSummary = async (_req, res) => {
  const summary = await getDashboardSummaryService();
  return res.json(summary);
};

export const listApplications = async (req, res) => {
  const pagination = getPagination(req.query);
  const applications = await listApplicationsService(pagination);
  return res.json(applications);
};

export const getApplicationByReference = async (req, res) => {
  const referenceNo = String(req.params.reference_no || "").trim().toUpperCase();

  if (!referenceNo) {
    return sendError(res, "reference_no is required.", 400);
  }

  const application = await getApplicationByReferenceService(referenceNo);

  if (!application) {
    return sendError(res, "Application not found.", 404);
  }

  return res.json(application);
};

export const updateApplicationStatus = async (req, res) => {
  const status = String(req.body.status || "").trim();

  if (!status) {
    return sendError(res, "status is required.", 400);
  }

  if (!APPLICATION_STATUSES.includes(status)) {
    return sendError(
      res,
      `Invalid status. Allowed statuses: ${APPLICATION_STATUSES.join(", ")}`,
      400
    );
  }

  const application = await updateApplicationStatusService(req.params.id, status);

  if (!application) {
    return sendError(res, "Application not found.", 404);
  }

  return res.json(application);
};
