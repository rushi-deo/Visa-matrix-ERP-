import { createClient } from "@supabase/supabase-js";

// This module is imported by browser bundles. A service-role key would grant
// unrestricted database access to every visitor, so only public Vite values
// are valid here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const maskSensitiveValue = (value, visibleStart = 6, visibleEnd = 4) => {
  if (!value) {
    return null;
  }

  if (value.length <= visibleStart + visibleEnd) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, visibleStart)}...${value.slice(-visibleEnd)}`;
};

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const getSupabaseConfigStatus = () => ({
  status: isSupabaseConfigured ? "configured" : "missing_env",
  url: maskSensitiveValue(SUPABASE_URL),
  anonKey: maskSensitiveValue(SUPABASE_ANON_KEY),
});

if (isSupabaseConfigured) {
  console.info(
    "[Supabase] Client configured with a public anon key.",
    getSupabaseConfigStatus(),
  );
} else {
  console.warn("[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.", getSupabaseConfigStatus());
}

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
