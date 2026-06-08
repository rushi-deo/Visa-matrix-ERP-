import { createCrudRepository } from "../../core/baseRepository.js";
import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";

const countryCrudRepository = createCrudRepository({
  tableName: "countries",
});

const sanitizeSearchTerm = (value) => {
  return String(value || "")
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const listCountries = async (query = {}) => {
  let countriesQuery = supabase
    .from("countries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const searchTerm = sanitizeSearchTerm(query.search);

  if (searchTerm) {
    countriesQuery = countriesQuery.or(
      [
        `country_name.ilike.%${searchTerm}%`,
        `country_code.ilike.%${searchTerm}%`,
        `region.ilike.%${searchTerm}%`,
      ].join(",")
    );
  }

  const { data, error, count } = await countriesQuery;

  if (error) {
    throw fromSupabaseError(error, "Failed to list countries.");
  }

  return {
    items: data || [],
    pagination: {
      total: count ?? data?.length ?? 0,
    },
  };
};

export const getCountryById = (id) => countryCrudRepository.findById(id);
export const createCountry = (payload) => countryCrudRepository.create(payload);
export const updateCountry = (id, payload) =>
  countryCrudRepository.update(id, payload);
export const deleteCountry = (id) => countryCrudRepository.remove(id);
