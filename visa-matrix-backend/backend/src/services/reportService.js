import supabase from "../config/supabaseClient.js";
import { mapDatabaseError } from "./baseService.js";

const roundPercentage = (value) => {
  return Number(value.toFixed(2));
};

export const getApplicationsByCountryReport = async () => {
  const [countriesResult, applicationsResult] = await Promise.all([
    supabase
      .from("countries")
      .select("id, country_name, country_code")
      .order("country_name", { ascending: true }),
    supabase.from("applications").select("country_id, application_status"),
  ]);

  if (countriesResult.error) {
    throw mapDatabaseError(
      countriesResult.error,
      "Failed to load country data for reporting"
    );
  }

  if (applicationsResult.error) {
    throw mapDatabaseError(
      applicationsResult.error,
      "Failed to load application data for reporting"
    );
  }

  const applications = applicationsResult.data || [];

  return {
    items: (countriesResult.data || []).map((country) => {
      const countryApplications = applications.filter(
        (application) => String(application.country_id) === String(country.id)
      );

      const status_breakdown = countryApplications.reduce((result, application) => {
        const key = application.application_status || "unknown";
        result[key] = (result[key] || 0) + 1;
        return result;
      }, {});

      return {
        country_id: country.id,
        country_name: country.country_name,
        country_code: country.country_code,
        total_applications: countryApplications.length,
        status_breakdown,
      };
    }),
  };
};

export const getRevenueReport = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("amount, currency, payment_status, paid_at");

  if (error) {
    throw mapDatabaseError(error, "Failed to load payments for reporting");
  }

  const totalsByCurrency = (data || []).reduce((result, payment) => {
    const currency = payment.currency || "UNKNOWN";

    if (!result[currency]) {
      result[currency] = {
        currency,
        paid_total: 0,
        pending_total: 0,
        failed_total: 0,
        paid_count: 0,
        pending_count: 0,
        failed_count: 0,
      };
    }

    const amount = Number(payment.amount || 0);
    const bucket = result[currency];

    if (payment.payment_status === "paid") {
      bucket.paid_total += amount;
      bucket.paid_count += 1;
    } else if (payment.payment_status === "failed") {
      bucket.failed_total += amount;
      bucket.failed_count += 1;
    } else {
      bucket.pending_total += amount;
      bucket.pending_count += 1;
    }

    return result;
  }, {});

  return {
    items: Object.values(totalsByCurrency),
  };
};

export const getApprovalRateReport = async () => {
  const [applicationsResult, countriesResult] = await Promise.all([
    supabase.from("applications").select("country_id, application_status"),
    supabase.from("countries").select("id, country_name, country_code"),
  ]);

  if (applicationsResult.error) {
    throw mapDatabaseError(
      applicationsResult.error,
      "Failed to load applications for approval rate reporting"
    );
  }

  if (countriesResult.error) {
    throw mapDatabaseError(
      countriesResult.error,
      "Failed to load countries for approval rate reporting"
    );
  }

  const applications = applicationsResult.data || [];
  const approvedApplications = applications.filter(
    (application) => application.application_status === "approved"
  ).length;
  const rejectedApplications = applications.filter(
    (application) => application.application_status === "rejected"
  ).length;
  const decidedApplications = approvedApplications + rejectedApplications;

  const byCountry = (countriesResult.data || []).map((country) => {
    const countryApplications = applications.filter(
      (application) => String(application.country_id) === String(country.id)
    );
    const approved = countryApplications.filter(
      (application) => application.application_status === "approved"
    ).length;
    const rejected = countryApplications.filter(
      (application) => application.application_status === "rejected"
    ).length;
    const decided = approved + rejected;

    return {
      country_id: country.id,
      country_name: country.country_name,
      country_code: country.country_code,
      total_applications: countryApplications.length,
      approved_applications: approved,
      rejected_applications: rejected,
      approval_rate: decided ? roundPercentage((approved / decided) * 100) : 0,
    };
  });

  return {
    total_applications: applications.length,
    approved_applications: approvedApplications,
    rejected_applications: rejectedApplications,
    pending_applications: applications.length - decidedApplications,
    approval_rate: decidedApplications
      ? roundPercentage((approvedApplications / decidedApplications) * 100)
      : 0,
    by_country: byCountry,
  };
};
