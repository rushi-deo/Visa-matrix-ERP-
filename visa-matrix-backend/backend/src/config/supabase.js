import { createClient } from "@supabase/supabase-js";
import env from "./env.js";

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  clientOptions
);

export const createSupabaseUserClient = (accessToken) => {
  return createClient(
    env.supabaseUrl,
    env.supabaseAnonKey || env.supabaseServiceRoleKey,
    {
      ...clientOptions,
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};

export default supabase;
