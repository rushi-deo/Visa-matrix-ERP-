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
  if (!env.supabaseAnonKey) {
    throw new Error(
      "SUPABASE_ANON_KEY is required for user-scoped Supabase access.",
    );
  }
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw new Error("A user access token is required for user-scoped Supabase access.");
  }

  return createClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
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
