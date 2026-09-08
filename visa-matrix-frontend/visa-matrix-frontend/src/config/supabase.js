import { createClient } from "@supabase/supabase-js";

// Browser code may use only the public anon key.  Authentication itself is
// handled by the API; this client remains for the existing public data views.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default supabase;
