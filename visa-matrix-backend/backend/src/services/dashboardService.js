import { supabase } from "../config/supabaseClient.js";
import {
  countApplicationsMissingDocuments,
  countApplicationsWithPendingPayments,
} from "../utils/applicationData.js";
import { APPROVED_APPLICATION_STATUSES } from "../utils/adminConstants.js";
import { loadApplicationRelations } from "./applicationService.js";

const createRequestError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const countApplications = async (buildQuery = (query) => query) => {
  const query = buildQuery(
    supabase.from("applications").select("id", {
      count: "exact",
      head: true,
    })
  );
  const { count, error } = await query;

  if (error) {
    throw createRequestError(`Failed to count applications: ${error.message}`);
  }

  return count || 0;
};

export const getDashboardSummary = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalApplications,
    applicationsToday,
    approvedApplications,
    rejectedApplications,
    applicationsResult,
  ] = await Promise.all([
    countApplications(),
    countApplications((query) =>
      query.gte("created_at", startOfToday.toISOString())
    ),
    countApplications((query) => query.in("status", APPROVED_APPLICATION_STATUSES)),
    countApplications((query) => query.eq("status", "Rejected")),
    supabase
      .from("applications")
      .select(
        "id, reference_no, user_id, profile_id, country_id, status, payment_status, visa_type, created_at"
      ),
  ]);

  if (applicationsResult.error) {
    throw createRequestError(
      `Failed to load applications for dashboard summary: ${applicationsResult.error.message}`
    );
  }

  const applications = applicationsResult.data || [];
  const relations = await loadApplicationRelations(applications);

  return {
    total_applications: totalApplications,
    applications_today: applicationsToday,
    pending_documents: countApplicationsMissingDocuments(applications, relations),
    payments_pending: countApplicationsWithPendingPayments(applications, relations),
    visas_approved: approvedApplications,
    visas_rejected: rejectedApplications,
  };
};
