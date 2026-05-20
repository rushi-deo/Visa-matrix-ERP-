import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate environment variables
const hasValidSupabaseConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  /^https?:\/\//.test(supabaseUrl);

// Throw error early if config is missing
if (!hasValidSupabaseConfig) {
  console.error("❌ Supabase ENV not configured properly");
  console.log("SUPABASE_URL:", supabaseUrl);
  console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "Loaded ✅" : "Missing ❌");
}

const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { supabase, hasValidSupabaseConfig };