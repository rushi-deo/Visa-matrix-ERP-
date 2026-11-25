import supabase from "../../config/supabase.js";
import { createCrudRepository } from "../../core/baseRepository.js";
import { fromSupabaseError, NotFoundError } from "../../core/errors.js";

const applicationCrudRepository = createCrudRepository({
  tableName: "applications",
  defaultOrder: "created_at",
  allowedFilters: ["customer_id", "country_id", "visa_type_id", "status", "application_status", "organization_id"],
  allowedOrderColumns: [
    "created_at",
    "updated_at",
    "customer_id",
    "country_id",
    "status",
    "application_status",
    "reference_no",
    "submission_date",
    "embassy_date",
    "decision_date",
  ],
});

const buildApplicationDisplayRow = (application, relations = {}) => {
  const relatedCustomer = relations.customersById?.get(String(application.customer_id)) ?? null;
  const customer = relatedCustomer &&
    String(relatedCustomer.organization_id) === String(application.organization_id)
    ? relatedCustomer
    : null;
  const country = relations.countriesById?.get(String(application.country_id)) ?? null;
  const visaType = relations.visaTypesById?.get(String(application.visa_type_id)) ?? null;
  const relatedPayment = relations.paymentsByApplicationId?.get(String(application.id)) ?? null;
  const payment = relatedPayment &&
    String(relatedPayment.organization_id) === String(application.organization_id)
    ? relatedPayment
    : null;
  const relatedWorkflow = relations.workflowsByApplicationId?.get(String(application.id)) ?? null;
  const workflow = relatedWorkflow &&
    String(relatedWorkflow.organization_id) === String(application.organization_id)
    ? relatedWorkflow
    : null;

  return {
    ...application,
    application_number:
      application.reference_no ||
      application.application_number ||
      application.application_code ||
      application.id,
    customer_name:
      customer?.full_name ||
      application.customer_name ||
      null,
    destination_country:
      country?.country_name ||
      application.destination_country ||
      null,
    visa_type:
      visaType?.visa_name ||
      application.visa_type ||
      null,
    application_status:
      application.application_status || application.status || "draft",
    stage:
      workflow?.stage ||
      application.stage ||
      application.application_status ||
      null,
    assigned_employee:
      application.assigned_to ||
      application.assigned_employee ||
      null,
    payment_status:
      payment?.payment_status ||
      application.payment_status ||
      null,
  };
};

const buildRelations = async (applications = []) => {
  const customerIds = [...new Set(applications.map((item) => item.customer_id).filter(Boolean))];
  const countryIds = [...new Set(applications.map((item) => item.country_id).filter(Boolean))];
  const visaTypeIds = [...new Set(applications.map((item) => item.visa_type_id).filter(Boolean))];
  const applicationIds = [...new Set(applications.map((item) => item.id).filter(Boolean))];

  const [customersResult, countriesResult, visaTypesResult, paymentsResult, workflowsResult] =
    await Promise.all([
      customerIds.length
        ? supabase.from("customers").select("id, full_name, organization_id").in("id", customerIds)
        : Promise.resolve({ data: [] }),
      countryIds.length
        ? supabase.from("countries").select("id, country_name").in("id", countryIds)
        : Promise.resolve({ data: [] }),
      visaTypeIds.length
        ? supabase.from("visa_types").select("id, visa_name").in("id", visaTypeIds)
        : Promise.resolve({ data: [] }),
      applicationIds.length
        ? supabase
            .from("payments")
            .select("id, application_id, payment_status, organization_id, created_at")
            .in("application_id", applicationIds)
        : Promise.resolve({ data: [] }),
      applicationIds.length
        ? supabase
            .from("workflows")
            .select("id, application_id, stage, organization_id, created_at")
            .in("application_id", applicationIds)
        : Promise.resolve({ data: [] }),
    ]);

  const customersById = new Map(
    (customersResult.data || []).map((row) => [String(row.id), row]),
  );
  const countriesById = new Map(
    (countriesResult.data || []).map((row) => [String(row.id), row]),
  );
  const visaTypesById = new Map(
    (visaTypesResult.data || []).map((row) => [String(row.id), row]),
  );
  const paymentsByApplicationId = new Map(
    (paymentsResult.data || [])
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map((row) => [String(row.application_id), row]),
  );
  const workflowsByApplicationId = new Map(
    (workflowsResult.data || [])
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map((row) => [String(row.application_id), row]),
  );

  return {
    customersById,
    countriesById,
    visaTypesById,
    paymentsByApplicationId,
    workflowsByApplicationId,
  };
};

export const listApplications = (query = {}, organizationId = null) => {
  return applicationCrudRepository.list({
    page: query.page,
    limit: query.limit,
    filters: {
      customer_id: query.customerId,
      country_id: query.countryId,
      visa_type_id: query.visaTypeId,
      status: query.status,
      application_status: query.applicationStatus,
      organization_id: organizationId,
    },
    notNullFilters: organizationId ? [] : ["organization_id"],
    searchTerm: query.search,
    searchColumns: ["reference_no", "status", "application_status", "notes"],
  }).then(async (result) => {
    const relations = await buildRelations(result.items || []);

    return {
      ...result,
      items: (result.items || []).map((application) =>
        buildApplicationDisplayRow(application, relations),
      ),
    };
  });
};

export const getApplicationById = async (id, organizationId = null) => {
  let request = supabase.from("applications").select("*").eq("id", id);
  request = organizationId
    ? request.eq("organization_id", organizationId)
    : request.not("organization_id", "is", null);
  const { data, error } = await request.maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch application record.");
  if (!data) throw new NotFoundError("applications record not found.");
  return data;
};
export const createApplication = (payload) =>
  applicationCrudRepository.create(payload);
export const updateApplication = async (id, payload, organizationId = null) => {
  let query = supabase.from("applications").update(payload).eq("id", id);
  query = organizationId
    ? query.eq("organization_id", organizationId)
    : query.not("organization_id", "is", null);
  const { data, error } = await query.select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update application record.");
  if (!data) throw new NotFoundError("applications record not found.");
  return data;
};
export const deleteApplication = async (id, organizationId = null) => {
  let query = supabase.from("applications").delete().eq("id", id);
  query = organizationId
    ? query.eq("organization_id", organizationId)
    : query.not("organization_id", "is", null);
  const { data, error } = await query.select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete application record.");
  if (!data) throw new NotFoundError("applications record not found.");
  return data;
};
export const deleteApplicationById = (id) => applicationCrudRepository.remove(id);
