import supabase from "../config/supabase.js";
import {
  AppError,
  NotFoundError,
  fromSupabaseError,
} from "./errors.js";
import {
  buildPaginationMeta,
  getPaginationOptions,
} from "../utils/pagination.js";

const sanitizeSearchTerm = (value) => {
  return String(value || "")
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const createCrudRepository = ({
  tableName,
  defaultSelect = "*",
  defaultOrder = "created_at",
  allowedFilters = [],
  softDelete = false,
}) => {
  const list = async ({
    page = 1,
    limit = 20,
    filters = {},
    searchTerm = "",
    searchColumns = [],
    select = defaultSelect,
    orderBy = defaultOrder,
    ascending = false,
  } = {}) => {
    const pagination = getPaginationOptions(page, limit);
    let query = supabase.from(tableName).select(select, { count: "exact" });
if (softDelete) {
  query = query.is("deleted_at", null);
}
   Object.entries(filters)
  .filter(
    ([column, value]) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (allowedFilters.length === 0 || allowedFilters.includes(column))
  )
  .forEach(([column, value]) => {
    query = query.eq(column, value);
  });

    const normalizedSearch = sanitizeSearchTerm(searchTerm);

    if (normalizedSearch && searchColumns.length) {
      query = query.or(
        searchColumns
          .map((column) => `${column}.ilike.%${normalizedSearch}%`)
          .join(",")
      );
    }

    const sortColumn =
  allowedOrderColumns.includes(orderBy) ? orderBy : defaultOrder;

query = query.order(sortColumn, { ascending });
    query = query.range(pagination.from, pagination.to);

    const { data, error, count } = await query;

    if (error) {
      throw fromSupabaseError(error, `Failed to list ${tableName}.`);
    }

    return {
      items: data || [],
      pagination: buildPaginationMeta(count || 0, pagination.page, pagination.limit),
    };
  };

  const findById = async (id, select = defaultSelect) => {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw fromSupabaseError(error, `Failed to fetch ${tableName} record.`);
    }

    if (!data) {
      throw new NotFoundError(`${tableName} record not found.`);
    }

    return data;
  };

  const create = async (payload, select = defaultSelect) => {
    const { data, error } = await supabase
      .from(tableName)
      .insert(payload)
      .select(select)
      .single();

    if (error) {
      throw fromSupabaseError(error, `Failed to create ${tableName} record.`);
    }

    return data;
  };

  const update = async (id, payload, select = defaultSelect) => {
    if (!payload || Object.keys(payload).length === 0) {
      throw new AppError("Update payload cannot be empty.", 400);
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(payload)
      .eq("id", id)
      .select(select)
      .maybeSingle();

    if (error) {
      throw fromSupabaseError(error, `Failed to update ${tableName} record.`);
    }

    if (!data) {
      throw new NotFoundError(`${tableName} record not found.`);
    }

    return data;
  };

  const remove = async (id, select = "id") => {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id)
      .select(select)
      .maybeSingle();

    if (error) {
      throw fromSupabaseError(error, `Failed to delete ${tableName} record.`);
    }

    if (!data) {
      throw new NotFoundError(`${tableName} record not found.`);
    }

    return data;
  };

  return {
    list,
    findById,
    create,
    update,
    remove,
  };
};
