import supabase from "../config/supabaseClient.js";
import { ApiError } from "../utils/apiError.js";
import { buildIlikeOrQuery, sanitizeSearchTerm } from "../utils/query.js";
import { mapDatabaseError } from "./baseService.js";

const customerSelect =
  "id, full_name, email, phone, passport_number, nationality, created_at";
const applicationSelect =
  "id, customer_id, country_id, visa_type_id, application_status, submission_date, decision_date, notes, created_at";
const countrySelect =
  "id, country_name, country_code, visa_required, processing_time";

const mergeApplications = (applicationGroups) => {
  const seen = new Set();

  return applicationGroups.flat().filter((application) => {
    if (!application?.id || seen.has(application.id)) {
      return false;
    }

    seen.add(application.id);
    return true;
  });
};

export const searchReferences = async (searchTerm) => {
  const normalizedSearch = sanitizeSearchTerm(searchTerm);

  if (!normalizedSearch) {
    throw new ApiError(400, "Query parameter q is required.");
  }

  const [customersResult, countriesResult] = await Promise.all([
    supabase
      .from("customers")
      .select(customerSelect)
      .or(
        buildIlikeOrQuery(
          ["full_name", "email", "phone", "passport_number"],
          normalizedSearch
        )
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("countries")
      .select(countrySelect)
      .or(buildIlikeOrQuery(["country_name", "country_code"], normalizedSearch))
      .order("country_name", { ascending: true })
      .limit(10),
  ]);

  if (customersResult.error) {
    throw mapDatabaseError(customersResult.error, "Failed to search customers");
  }

  if (countriesResult.error) {
    throw mapDatabaseError(countriesResult.error, "Failed to search countries");
  }

  const customerIds = (customersResult.data || []).map((customer) => customer.id);

  const applicationSearches = [
    supabase
      .from("applications")
      .select(applicationSelect)
      .or(buildIlikeOrQuery(["application_status", "notes"], normalizedSearch))
      .order("created_at", { ascending: false })
      .limit(10),
  ];

  if (customerIds.length) {
    applicationSearches.push(
      supabase
        .from("applications")
        .select(applicationSelect)
        .in("customer_id", customerIds)
        .order("created_at", { ascending: false })
        .limit(10)
    );
  }

  const applicationResults = await Promise.all(applicationSearches);

  applicationResults.forEach((result) => {
    if (result.error) {
      throw mapDatabaseError(result.error, "Failed to search applications");
    }
  });

  return {
    query: normalizedSearch,
    customers: customersResult.data || [],
    applications: mergeApplications(
      applicationResults.map((result) => result.data || [])
    ),
    countries: countriesResult.data || [],
  };
};
