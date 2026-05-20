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

const createQuestionServiceError = () => {
  const error = new Error('Failed to fetch visa questions');
  error.statusCode = 500;
  return error;
};

const toQuestionResponse = (item) => ({
  id: item.id,
  label: item.label || item.requirement || item.name || 'Question',
  type: item.type || 'text',
  required: item.required ?? true,
  options: item.options || []
});

const getAllCountries = async () => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.from('countries').select('*');

  if (error) {
    error.statusCode = 500;
    throw error;
  }

  return data;
};

const getQuestionsByCountryId = async (countryId) => {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from('visa_types')
    .select('*')
    .eq('country_id', countryId);

  if (error) {
    console.error('[CountriesService] visa_type query failed:', {
      code: error.code,
      message: error.message
    });
    throw createQuestionServiceError();
  }

  return {
    questions: (data ?? []).map(toQuestionResponse)
  };
};

export default {
  getAllCountries,
  getQuestionsByCountryId
};
