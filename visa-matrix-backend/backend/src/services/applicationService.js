import supabase from "../config/supabase.js";
import {
  applyTenantToPayload,
  assertTenantAccess,
  getTenantOrganizationScope,
} from "../utils/tenantSecurity.js";
import { getPaginationOptions, buildPaginationMeta } from "../utils/pagination.js";
import { ForbiddenError, NotFoundError, fromSupabaseError } from "../core/errors.js";

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

const buildInsertError = (error, tableName) => {
  const insertError = new Error(error?.message || "Supabase insert failed.");

  insertError.statusCode =
    error?.code === "23503" ? 400 : error?.code === "23505" ? 409 : 500;
  insertError.code = error?.code || null;
  insertError.details = error?.details || null;
  insertError.hint = error?.hint || null;
  insertError.tableName = tableName;

  if (/row-level security|rls/i.test(insertError.message)) {
    insertError.rlsHint =
      "RLS may be blocking insert. Disable RLS temporarily or add a proper INSERT policy.";
  }

  return insertError;
};

export const listApplications = async (queryParams = {}, authContext = {}) => {
  const pagination = getPaginationOptions(queryParams.page, queryParams.limit);
  const organizationId = getTenantOrganizationScope(authContext);
  let query = supabase.from("applications").select("*", { count: "exact" });
  query = organizationId
    ? query.eq("organization_id", organizationId)
    : query.not("organization_id", "is", null);
  if (queryParams.status) query = query.eq("status", queryParams.status);
  if (queryParams.application_status) query = query.eq("application_status", queryParams.application_status);
  query = query.order("created_at", { ascending: false }).range(pagination.from, pagination.to);

  const { data, error, count } = await query;
  if (error) throw fromSupabaseError(error, "Failed to list applications.");
  return {
    items: data || [],
    pagination: buildPaginationMeta(count || 0, pagination.page, pagination.limit),
  };
};

export const getApplicationById = async (id, authContext = {}) => {
  const organizationId = getTenantOrganizationScope(authContext);
  let query = supabase.from("applications").select("*").eq("id", id);
  query = organizationId
    ? query.eq("organization_id", organizationId)
    : query.not("organization_id", "is", null);
  const { data: application, error } = await query.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch application.");
  if (!application) throw new NotFoundError("Application not found.");

  return assertTenantAccess(application, authContext, "application");
};

export const createApplication = async (payload, authContext = {}) => {
  const data = mapApplicationPayload(applyTenantToPayload(payload, authContext));

  if (data.customer_id) {
    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, organization_id")
      .eq("id", data.customer_id)
      .eq("organization_id", data.organization_id)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Failed to validate application customer.");
    if (!customer) throw new ForbiddenError("Application customer must belong to the same organization.");
  }

  let lastError = null;

  for (const tableName of APPLICATION_TABLE_CANDIDATES) {
    const response = await supabase
      .from(tableName)
      .insert([data])
      .select();

    if (response.error) {
      lastError = buildInsertError(response.error, tableName);

      if (tableName !== "applications" && isMissingTableError(response.error)) {
        continue;
      }

      throw lastError;
    }

    return Array.isArray(response.data) ? response.data[0] : response.data;
  }

  throw lastError || new Error("Failed to create application.");
};

export const updateApplication = async (id, payload, authContext = {}) => {
  const application = await getApplicationById(id, authContext);
  assertTenantAccess(application, authContext, "application");
  const data = mapApplicationPayload(applyTenantToPayload({
    ...payload,
    organization_id: application.organization_id,
  }, authContext));
  if (data.customer_id) {
    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, organization_id")
      .eq("id", data.customer_id)
      .eq("organization_id", application.organization_id)
      .maybeSingle();
    if (error) throw fromSupabaseError(error, "Failed to validate application customer.");
    if (!customer) throw new ForbiddenError("Application customer must belong to the same organization.");
  }
  let query = supabase.from("applications").update(data).eq("id", id);
  query = application.organization_id
    ? query.eq("organization_id", application.organization_id)
    : query.not("organization_id", "is", null);
  const { data: updated, error } = await query.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update application.");
  if (!updated) throw new NotFoundError("Application not found.");
  return assertTenantAccess(updated, authContext, "application");
};

export const deleteApplication = async (id, authContext = {}) => {
  const application = await getApplicationById(id, authContext);

  assertTenantAccess(application, authContext, "application");

  let query = supabase.from("applications").delete().eq("id", id);
  query = application.organization_id
    ? query.eq("organization_id", application.organization_id)
    : query.not("organization_id", "is", null);
  const { data: deletedApplication, error } = await query.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete application.");
  if (!deletedApplication) throw new NotFoundError("Application not found.");

  return {
    id: deletedApplication.id,
  };
};
