import supabase from "../../config/supabase.js";
import { fromSupabaseError } from "../../core/errors.js";

const EMPLOYEE_FIELDS = `*, departments(id, name), designations(id, name)`;

export const listEmployees = async ({ page, pageSize, search, department, status, organization_id } = {}) => {
  try {
    let query = supabase.from("employees").select(EMPLOYEE_FIELDS, { count: "exact" }).order("created_at", { ascending: false });

    if (organization_id) query = query.eq("organization_id", organization_id);
    if (department) query = query.eq("department_id", department);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_code.ilike.%${search}%`);

    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      items: data ?? [],
      total: count ?? (data ? data.length : 0),
    };
  } catch (error) {
    throw fromSupabaseError(error, "Failed to list employees.");
  }
};

export const getEmployeeById = async (employeeId) => {
  try {
    const { data, error } = await supabase.from("employees").select(EMPLOYEE_FIELDS).eq("id", employeeId).maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to fetch employee.");
  }
};

export const createEmployee = async (payload) => {
  try {
    const record = {
      ...payload,
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: payload.updated_at || new Date().toISOString(),
    };

    const { data, error } = await supabase.from("employees").insert(record).select(EMPLOYEE_FIELDS).single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to create employee.");
  }
};

export const updateEmployee = async (employeeId, payload) => {
  try {
    const { data, error } = await supabase.from("employees").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", employeeId).select(EMPLOYEE_FIELDS).single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to update employee.");
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const { error } = await supabase.from("employees").delete().eq("id", employeeId);
    if (error) throw error;
    return true;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to delete employee.");
  }
};

// Departments
export const listDepartments = async (organization_id) => {
  try {
    let query = supabase.from("departments").select("*").order("name");
    if (organization_id) query = query.eq("organization_id", organization_id);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw fromSupabaseError(error, "Failed to list departments.");
  }
};

export const createDepartment = async (payload) => {
  try {
    const record = { ...payload, created_at: payload.created_at || new Date().toISOString(), updated_at: payload.updated_at || new Date().toISOString() };
    const { data, error } = await supabase.from("departments").insert(record).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to create department.");
  }
};

export const updateDepartment = async (departmentId, payload) => {
  try {
    const { data, error } = await supabase.from("departments").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", departmentId).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to update department.");
  }
};

export const deleteDepartment = async (departmentId) => {
  try {
    const { error } = await supabase.from("departments").delete().eq("id", departmentId);
    if (error) throw error;
    return true;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to delete department.");
  }
};

// Designations
export const listDesignations = async (department_id) => {
  try {
    let query = supabase.from("designations").select("*").order("level");
    if (department_id) query = query.eq("department_id", department_id);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw fromSupabaseError(error, "Failed to list designations.");
  }
};

export const createDesignation = async (payload) => {
  try {
    const record = { ...payload, created_at: payload.created_at || new Date().toISOString(), updated_at: payload.updated_at || new Date().toISOString() };
    const { data, error } = await supabase.from("designations").insert(record).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    throw fromSupabaseError(error, "Failed to create designation.");
  }
};
