import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
)?.trim();
const supabaseServiceRoleKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export default supabase;
