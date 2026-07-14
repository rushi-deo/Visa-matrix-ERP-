/**
 * DIAGNOSTIC SCRIPT - Check actual Supabase schema at runtime
 * 
 * This script connects to your Supabase instance and reports what columns
 * the customers table ACTUALLY has, versus what the code expects.
 * 
 * Usage:
 * node diagnose-schema.js
 * 
 * Make sure .env is configured with your Supabase credentials first.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(configDirectory, "../../.env");

dotenv.config({ path: envPath });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ ERROR: Missing Supabase credentials in .env");
  console.error("   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("🔍 SUPABASE SCHEMA DIAGNOSTIC");
console.log("━".repeat(80));
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log("━".repeat(80));

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function diagnoseSchema() {
  try {
    // Test 1: Can we connect?
    console.log("\n✅ Step 1: Checking Supabase connection...");
    const { data: healthCheck } = await supabase.from("customers").select("count()", { count: "exact" });
    console.log("   ✓ Connected successfully");

    // Test 2: List all columns in customers table
    console.log("\n✅ Step 2: Querying customers table metadata...");
    const { data: columns, error: columnsError } = await supabase.rpc(
      "get_table_columns",
      { table_name: "customers", schema_name: "public" }
    ).catch(() => null);

    if (columnsError || !columns) {
      console.log("   ⚠️  RPC method not available, attempting direct query...");
      
      // Fallback: Try to SELECT 1 row and see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from("customers")
        .select("*")
        .limit(1);

      if (sampleError) {
        console.error("   ❌ Failed to query customers table:", sampleError.message);
        console.error("   Details:", sampleError);
        process.exit(1);
      }

      if (!sampleData || sampleData.length === 0) {
        console.log("\n   ℹ️  customers table is empty, checking table structure via INSERT test...");
        
        // Try to insert with full_name
        const { error: insertError } = await supabase.from("customers").insert({
          full_name: "Test User",
          email: "test@example.com",
          phone: "1234567890",
          passport_number: "ABC123",
        }).select().single();

        if (insertError) {
          if (insertError.message.includes("full_name")) {
            console.log("\n   ❌ FINDING: full_name column DOES NOT EXIST");
            console.log("   Error:", insertError.message);
          } else {
            console.log("\n   ❌ INSERT failed:", insertError.message);
          }
        } else {
          console.log("   ✓ INSERT succeeded - full_name column EXISTS");
        }
        return;
      }

      // Get column names from sample data
      const actualColumns = Object.keys(sampleData[0]);
      console.log("\n📋 ACTUAL COLUMNS IN CUSTOMERS TABLE:");
      console.log("   " + actualColumns.map((col, i) => `${i + 1}. ${col}`).join("\n   "));

      // Compare with expected
      console.log("\n📋 EXPECTED COLUMNS (from code):");
      const expectedColumns = [
        "id",
        "user_id",
        "full_name",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone",
        "country_id",
        "status",
        "passport_number",
        "nationality",
        "date_of_birth",
        "notes",
        "created_at",
        "updated_at",
      ];
      console.log("   " + expectedColumns.map((col, i) => `${i + 1}. ${col}`).join("\n   "));

      // Find mismatches
      console.log("\n🔴 MISSING COLUMNS (in actual but not in expected):");
      const missing = actualColumns.filter((col) => !expectedColumns.includes(col));
      if (missing.length > 0) {
        missing.forEach((col) => console.log(`   - ${col}`));
      } else {
        console.log("   (none)");
      }

      console.log("\n🟡 COLUMNS NOT FOUND (expected but not in actual):");
      const notFound = expectedColumns.filter((col) => !actualColumns.includes(col));
      if (notFound.length > 0) {
        notFound.forEach((col) => console.log(`   - ${col}`));
      } else {
        console.log("   (none)");
      }

      return;
    }

    // If RPC worked
    console.log("   ✓ Retrieved column metadata");
    console.log("\n📋 ACTUAL COLUMNS:");
    columns.forEach((col, i) => {
      console.log(`   ${i + 1}. ${col.column_name} (${col.data_type})`);
    });

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
    process.exit(1);
  }
}

diagnoseSchema().then(() => {
  console.log("\n✅ Diagnosis complete");
  process.exit(0);
});
