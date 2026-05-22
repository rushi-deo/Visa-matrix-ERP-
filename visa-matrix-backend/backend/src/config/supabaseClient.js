/**
 * Legacy Supabase client — prefer ./supabase.js for new code.
 * Re-exports the canonical client so older services keep working.
 */
import supabase from "./supabase.js";

export { supabase };
export default supabase;
