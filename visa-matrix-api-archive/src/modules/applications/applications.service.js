import { supabase } from '../../config/supabaseClient.js';

export const getAllApplications = async () => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        application_number,
        status,
        created_at,
        due_date,
        customer_id,
        country_id,
        visa_type_id,
        customers (id, name, email),
        countries (id, name),
        visa_types (id, name)
      `);

    if (error) throw error;

    const formattedData = data.map((app) => ({
      ...app,
      customer_name: app.customers?.name || null,
      email: app.customers?.email || null,
      country: app.countries?.name || null,
      visa_type: app.visa_types?.name || null,
      assigned_agent: null
    }));

    return formattedData;

  } catch (err) {
    console.error("Service Error:", err);
    throw err;
  }
};

export default {
  getApplications: getAllApplications
};
