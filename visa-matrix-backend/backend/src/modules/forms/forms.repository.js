import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";
import { buildPaginationMeta, getPaginationOptions } from "../../utils/pagination.js";

const FORM_TABLE = "form_schemas";
const normalizeVisaLabel = (value) => String(value ?? "").toLowerCase().replace(/\bvisa\b/g, "").replace(/[^a-z0-9]+/g, "").trim();

const mapFormRow = (row, names = {}) => ({
  ...row,
  country_id: row.country_id ?? names.countryId ?? null,
  visa_type_id: row.visa_type_id ?? names.visaTypeId ?? null,
  country_name: row.country_name ?? row.country ?? names.countryName ?? null,
  visa_type_name: row.visa_type_name ?? row.visa_type ?? names.visaTypeName ?? null,
  form_schema: row.form_schema ?? row.schema ?? {},
  version: row.version ?? 1,
  status: row.status ?? "published",
});

const getCatalogNames = async (countryId, visaTypeId) => {
  const [countryResult, visaTypeResult] = await Promise.all([
    supabase.from("countries").select("*").eq("id", countryId).maybeSingle(),
    supabase.from("visa_types").select("*").eq("id", visaTypeId).maybeSingle(),
  ]);

  if (countryResult.error) throw fromSupabaseError(countryResult.error, "Failed to resolve form country.");
  if (visaTypeResult.error) throw fromSupabaseError(visaTypeResult.error, "Failed to resolve form visa type.");

  const country = countryResult.data;
  const visaType = visaTypeResult.data;
  if (!country || !visaType) return null;

  return {
    countryId: String(country.id),
    countryName: country.country_name ?? country.name ?? country.country_code,
    visaTypeId: String(visaType.id),
    visaTypeName: visaType.visa_name ?? visaType.name ?? visaType.code,
    visaTypeAliases: [visaType.visa_name, visaType.name, visaType.code].filter(Boolean).map(String),
  };
};

const findCanonicalRow = async (names) => {
  if (!names?.countryName || !names.visaTypeAliases?.length) return null;

  const { data, error } = await supabase
    .from(FORM_TABLE)
    .select("*")
    .ilike("country", names.countryName);

  if (error) throw fromSupabaseError(error, "Failed to fetch form schema.");

  const aliases = new Set(names.visaTypeAliases.map(normalizeVisaLabel));
  const countryForms = data || [];
  const exactMatch = countryForms.find((row) => aliases.has(normalizeVisaLabel(row.visa_type)));
  if (exactMatch) return exactMatch;

  return countryForms.length === 1 ? countryForms[0] : null;
};

export const listForms = async (query = {}) => {
  const pagination = getPaginationOptions(query.page, query.limit);
  let request = supabase.from(FORM_TABLE).select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (pagination.limit) request = request.range(pagination.from, pagination.to);

  const { data, error, count } = await request;
  if (error) throw fromSupabaseError(error, "Failed to list forms.");

  return {
    items: (data || []).map((row) => mapFormRow(row)),
    pagination: buildPaginationMeta(count || 0, pagination.page, pagination.limit),
  };
};

export const getFormById = async (id) => {
  const { data, error } = await supabase.from(FORM_TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to fetch form.");
  return data ? mapFormRow(data) : null;
};

export const getFormByCountryAndVisaType = async (countryId, visaTypeId) => {
  const names = await getCatalogNames(countryId, visaTypeId);
  const row = await findCanonicalRow(names);
  return row ? mapFormRow(row, names) : null;
};

export const createForm = async (payload) => {
  const names = await getCatalogNames(payload.country_id, payload.visa_type_id);
  if (!names) throw new Error("Country or visa type not found.");

  const { data, error } = await supabase
    .from(FORM_TABLE)
    .insert({ country: names.countryName, visa_type: names.visaTypeName, schema: payload.form_schema })
    .select("*")
    .single();
  if (error) throw fromSupabaseError(error, "Failed to create form.");
  return mapFormRow(data, names);
};

export const updateForm = async (id, payload) => {
  const nextPayload = {};
  if (payload.form_schema !== undefined) nextPayload.schema = payload.form_schema;

  const { data, error } = await supabase.from(FORM_TABLE).update(nextPayload).eq("id", id).select("*").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to update form.");
  return data ? mapFormRow(data) : null;
};

export const deleteForm = async (id) => {
  const { data, error } = await supabase.from(FORM_TABLE).delete().eq("id", id).select("id").maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to delete form.");
  return data ?? null;
};

export const findCountryMatch = async (value) => {
  const term = String(value || "").trim();
  if (!term) return null;

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .or([`id.eq.${term}`, `name.ilike.${term}`, `code.ilike.${term}`].join(","))
    .limit(1)
    .maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to resolve country.");
  return data ?? null;
};

export const findVisaTypeMatch = async (value) => {
  const term = String(value || "").trim();
  if (!term) return null;

  const { data, error } = await supabase
    .from("visa_types")
    .select("*")
    .or([`id.eq.${term}`, `name.ilike.${term}`].join(","))
    .limit(1)
    .maybeSingle();
  if (error) throw fromSupabaseError(error, "Failed to resolve visa type.");
  return data ?? null;
};

export const findDuplicateForm = async ({ country_id, visa_type_id }) => {
  const names = await getCatalogNames(country_id, visa_type_id);
  return findCanonicalRow(names);
};
