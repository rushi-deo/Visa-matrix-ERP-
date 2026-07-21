import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";
import { buildPaginationMeta, getPaginationOptions } from "../../utils/pagination.js";

const FORM_TABLE = "form_configs";

const mapFormRow = (row, relations = {}) => {
  const country = relations.countriesById?.get(String(row.country_id)) ?? null;
  const visaType = relations.visaTypesById?.get(String(row.visa_type_id)) ?? null;

  return {
    ...row,
    country_name: country?.country_name ?? null,
    visa_type_name: visaType?.visa_name ?? null,
  };
};

const loadRelations = async (rows = []) => {
  const countryIds = [...new Set(rows.map((row) => row.country_id).filter(Boolean))];
  const visaTypeIds = [...new Set(rows.map((row) => row.visa_type_id).filter(Boolean))];

  const [countriesResult, visaTypesResult] = await Promise.all([
    countryIds.length
      ? supabase.from("countries").select("id, country_name").in("id", countryIds)
      : Promise.resolve({ data: [] }),
    visaTypeIds.length
      ? supabase.from("visa_types").select("id, visa_name").in("id", visaTypeIds)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    countriesById: new Map((countriesResult.data || []).map((row) => [String(row.id), row])),
    visaTypesById: new Map((visaTypesResult.data || []).map((row) => [String(row.id), row])),
  };
};

export const listForms = async (query = {}) => {
  const pagination = getPaginationOptions(query.page, query.limit);
  let request = supabase
    .from(FORM_TABLE)
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .order("version", { ascending: false });

  if (pagination.limit) {
    request = request.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await request;

  if (error) {
    throw fromSupabaseError(error, "Failed to list forms.");
  }

  const relations = await loadRelations(data || []);

  return {
    items: (data || []).map((row) => mapFormRow(row, relations)),
    pagination: buildPaginationMeta(count || 0, pagination.page, pagination.limit),
  };
};

export const getFormById = async (id) => {
  const { data, error } = await supabase
    .from(FORM_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch form.");
  }

  if (!data) {
    return null;
  }

  const relations = await loadRelations([data]);
  return mapFormRow(data, relations);
};

export const getFormByCountryAndVisaType = async (
  countryId,
  visaTypeId,
  status = null,
) => {
  let query = supabase
    .from(FORM_TABLE)
    .select("*")
    .eq("country_id", countryId)
    .eq("visa_type_id", visaTypeId)
    .order("version", { ascending: false })
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw fromSupabaseError(error, "Failed to fetch form.");
  }

  const row = Array.isArray(data) ? data[0] : data ?? null;

  if (!row) {
    return null;
  }

  const relations = await loadRelations([row]);
  return mapFormRow(row, relations);
};

export const createForm = async (payload) => {
  const { data, error } = await supabase
    .from(FORM_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw fromSupabaseError(error, "Failed to create form.");
  }

  const relations = await loadRelations([data]);
  return mapFormRow(data, relations);
};

export const updateForm = async (id, payload) => {
  const { data, error } = await supabase
    .from(FORM_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to update form.");
  }

  if (!data) {
    return null;
  }

  const relations = await loadRelations([data]);
  return mapFormRow(data, relations);
};

export const deleteForm = async (id) => {
  const { data, error } = await supabase
    .from(FORM_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to delete form.");
  }

  return data ?? null;
};

export const findCountryMatch = async (value) => {
  const term = String(value || "").trim();

  if (!term) {
    return null;
  }

  const { data, error } = await supabase
    .from("countries")
    .select("id, country_name, name, country_code")
    .or(
      [
        `id.eq.${term}`,
        `country_name.ilike.${term}`,
        `name.ilike.${term}`,
        `country_code.ilike.${term}`,
      ].join(","),
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to resolve country.");
  }

  return data ?? null;
};

export const findVisaTypeMatch = async (value) => {
  const term = String(value || "").trim();

  if (!term) {
    return null;
  }

  const { data, error } = await supabase
    .from("visa_types")
    .select("id, visa_name, name, code")
    .or(
      [
        `id.eq.${term}`,
        `visa_name.ilike.${term}`,
        `name.ilike.${term}`,
        `code.ilike.${term}`,
      ].join(","),
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to resolve visa type.");
  }

  return data ?? null;
};

export const findDuplicateForm = async ({ country_id, visa_type_id, name }) => {
  const { data, error } = await supabase
    .from(FORM_TABLE)
    .select("id, country_id, visa_type_id, name")
    .eq("country_id", country_id)
    .eq("visa_type_id", visa_type_id)
    .eq("name", name)
    .maybeSingle();

  if (error) {
    throw fromSupabaseError(error, "Failed to check duplicate form.");
  }

  return data ?? null;
};
