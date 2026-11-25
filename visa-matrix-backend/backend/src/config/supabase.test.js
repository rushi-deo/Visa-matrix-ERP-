import test from "node:test";
import assert from "node:assert/strict";

test("user-scoped Supabase access never falls back to the service-role key", async () => {
  const originalAnonKey = process.env.SUPABASE_ANON_KEY;
  process.env.SUPABASE_ANON_KEY = "";

  const { createSupabaseUserClient } = await import("./supabase.js");

  if (originalAnonKey === undefined) {
    delete process.env.SUPABASE_ANON_KEY;
  } else {
    process.env.SUPABASE_ANON_KEY = originalAnonKey;
  }

  assert.throws(
    () => createSupabaseUserClient("user-access-token"),
    /SUPABASE_ANON_KEY is required/,
  );
});
