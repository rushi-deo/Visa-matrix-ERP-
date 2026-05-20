import { hasValidSupabaseConfig, supabase } from '../../config/supabaseClient.js';

const ensureSupabaseConfigured = () => {
  if (!hasValidSupabaseConfig || !supabase) {
    const error = new Error(
      'Supabase is not configured. Update SUPABASE_URL and SUPABASE_ANON_KEY in .env.'
    );
    error.statusCode = 500;
    throw error;
  }
};

const getCountries = async () => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    error.statusCode = 500;
    throw error;
  }

  return data;
};

const createCountry = async (payload) => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from('countries')
    .insert([payload])
    .select();

  if (error) {
    error.statusCode = 500;
    throw error;
  }

  return data[0];
};

const getVisaTypes = async (countryId) => {
  ensureSupabaseConfigured();

  let query = supabase
    .from('visa_type')
    .select('*');

  if (countryId !== undefined) {
    query = query.eq('country_id', String(countryId));
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Backend error:', error);
    error.statusCode = 500;
    throw error;
  }

  return data ?? [];
};

const createVisaType = async (payload) => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from('visa_types')
    .insert([payload])
    .select();

  if (error) {
    error.statusCode = 500;
    throw error;
  }

  return data[0];
};

const getRequirements = async (visaTypeId) => {
  ensureSupabaseConfigured();

  let query = supabase
    .from('requirements')
    .select('*')
    .order('created_at', { ascending: false });

  if (visaTypeId !== undefined) {
    query = query.eq('visa_type_id', visaTypeId);
  }

  const { data, error } = await query;

  if (error) {
    error.statusCode = 500;
    throw error;
  }

  return data;
};

const createRequirement = async (payload) => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from('requirements')
    .insert([payload])
    .select();

  if (error) {
    error.statusCode = 500;
    throw error;
  }

  return data[0];
};

export default {
  getCountries,
  createCountry,
  getVisaTypes,
  createVisaType,
  getRequirements,
  createRequirement
};
