import supabase from "../config/supabase.js";
import {
  deleteRecord,
  fetchRecordById,
  listRecords,
  updateRecord,
} from "./baseService.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
} from "../utils/tenantSecurity.js";

const APPLICATION_TABLE_CANDIDATES = ["application", "applications"];

const COLUMN_KEY_MAP = {
  applicationStatus: "application_status",
  assignedTo: "assigned_to",
  countryId: "country_id",
  createdAt: "created_at",
  customerId: "customer_id",
  decisionDate: "decision_date",
  embassyDate: "embassy_date",
  embassyInterviewDate: "embassy_date",
  firstName: "first_name",
  lastName: "last_name",
  middleName: "middle_name",
  paymentStatus: "payment_status",
  profileId: "profile_id",
  referenceNo: "reference_no",
  submissionDate: "submission_date",
  travelDate: "travel_date",
  updatedAt: "updated_at",
  userId: "user_id",
  visaType: "visa_type",
  visaTypeId: "visa_type_id",
};

const camelToSnakeCase = (value) =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  );

const mapApplicationPayload = (payload = {}) => {
  const mappedPayload = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const normalizedKey =
      COLUMN_KEY_MAP[key] ||
      (/^[a-z0-9_]+$/.test(key) ? key : camelToSnakeCase(key));

    mappedPayload[normalizedKey] = value;
  });

  return compactObject(mappedPayload);
};

const isMissingTableError = (error) => {
  const errorMessage = `${error?.message || ""} ${error?.details || ""}`;

  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /relation .* does not exist/i.test(errorMessage) ||
    /could not find the table/i.test(errorMessage) ||
    /schema cache/i.test(errorMessage)
  );
};

const buildInsertError = (error, tableName, data) => {
  const insertError = new Error(error?.message || "Supabase insert failed.");

  insertError.statusCode =
    error?.code === "23503" ? 400 : error?.code === "23505" ? 409 : 500;
  insertError.code = error?.code || null;
  insertError.details = error?.details || null;
  insertError.hint = error?.hint || null;
  insertError.tableName = tableName;
  insertError.payload = data;

  if (/row-level security|rls/i.test(insertError.message)) {
    insertError.rlsHint =
      "RLS may be blocking insert. Disable RLS temporarily or add a proper INSERT policy.";
  }

  return insertError;
};

export const listApplications = async (queryParams) => {
  return listRecords("applications", queryParams, {
    select: "*",
    entityLabel: "Applications",
  });
};

export const getApplicationById = async (id, authContext = {}) => {
  const application = await fetchRecordById("applications", id, {
    select: "*",
    entityLabel: "Application",
  });

  return assertTenantAccess(application, authContext, "application");
};

export const createApplication = async (payload, authContext = {}) => {
  const data = mapApplicationPayload(applyTenantToPayload(payload, authContext));

  console.log("Data going to DB:", data);

  let lastError = null;

  for (const tableName of APPLICATION_TABLE_CANDIDATES) {
    const response = await supabase
      .from(tableName)
      .insert([data])
      .select();

    if (response.error) {
      console.error("Supabase Error:", {
        tableName,
        error: response.error,
      });

      lastError = buildInsertError(response.error, tableName, data);

      if (tableName !== "applications" && isMissingTableError(response.error)) {
        continue;
      }

      throw lastError;
    }

    console.log("Inserted Data:", response);
    return Array.isArray(response.data) ? response.data[0] : response.data;
  }

  throw lastError || new Error("Failed to create application.");
};

export const updateApplication = async (id, payload, authContext = {}) => {
  const application = await getApplicationById(id, authContext);

  assertTenantAccess(application, authContext, "application");

  return updateRecord("applications", id, applyTenantToPayload(payload, authContext), {
    select: "*",
    entityLabel: "Application",
  });
};

export const deleteApplication = async (id, authContext = {}) => {
  const application = await getApplicationById(id, authContext);

  assertTenantAccess(application, authContext, "application");

  const deletedApplication = await deleteRecord("applications", id, {
    select: "id",
    entityLabel: "Application",
  });

  return {
    id: deletedApplication.id,
  };
};
