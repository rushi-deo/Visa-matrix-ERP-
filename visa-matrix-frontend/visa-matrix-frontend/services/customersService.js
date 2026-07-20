import { supabase } from "../config/supabaseClient.js";

const CUSTOMER_COLUMNS = [
  "full_name",
  "email",
  "phone",
  "passport_number",
  "nationality",
];

const buildCustomerInsertPayload = (customerData = {}) => {
  const payload = {};

  for (const column of CUSTOMER_COLUMNS) {
    if (customerData[column] !== undefined) {
      payload[column] = customerData[column];
    }
  }

  return payload;
};

export const getCustomers = async (_user) => {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getCustomerById = async (customerId, _user) => {
  const { data, error } = await supabase.from("customers").select("*").eq("id", customerId).single();

  if (error) {
    throw error;
  }

  return data;
};

export const createCustomer = async (customerData, _user) => {
  const insertPayload = buildCustomerInsertPayload(customerData);
  console.log("customersService insert payload:", insertPayload);

  const { data, error } = await supabase
    .from("customers")
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error("Error in createCustomer service:", error.message, error.details, error.hint);
    throw error;
  }

  return data;
};
