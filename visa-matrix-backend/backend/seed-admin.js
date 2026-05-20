/**
 * Admin User Seeding Script
 * Creates a default admin user for testing JWT and RBAC
 *
 * Usage: node seed-admin.js
 */

import supabase from "./src/config/supabase.js";
import env from "./src/config/env.js";

const ADMIN_EMAIL = "admin@visamatrix.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_FULL_NAME = "Admin User";

async function seedAdminUser() {
  try {
    console.log("🌱 Starting admin user seed...\n");

    // Step 1: Check if admin user already exists in Supabase Auth
    console.log(`1️⃣  Checking if admin user exists...`);
    const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
    const adminAuthExists = existingAuthUser?.users?.some(
      (u) => u.email === ADMIN_EMAIL,
    );

    let authUserId;

    if (adminAuthExists) {
      console.log(`   ✓ Admin user already exists in Supabase Auth\n`);
      const existingUser = existingAuthUser.users.find(
        (u) => u.email === ADMIN_EMAIL,
      );
      authUserId = existingUser.id;
    } else {
      // Step 2: Create auth user in Supabase Auth
      console.log(`2️⃣  Creating admin user in Supabase Auth...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_FULL_NAME,
          role: "admin",
        },
      });

      if (error) {
        console.error(`   ❌ Failed to create auth user:`, error);
        throw error;
      }

      authUserId = data.user.id;
      console.log(`   ✓ Auth user created with ID: ${authUserId}\n`);
    }

    // Step 3: Create or update profile in profiles table
    console.log(`3️⃣  Creating/updating admin profile...`);

    // Try to create profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: authUserId, // Use auth user ID as profile ID for consistency
          auth_user_id: authUserId,
          full_name: ADMIN_FULL_NAME,
          email: ADMIN_EMAIL,
          role: "admin",
          is_active: true,
        },
        {
          onConflict: "email",
        },
      )
      .select()
      .single();

    if (profileError) {
      console.error(`   ⚠️  Profile creation error:`, profileError.message);

      // If profiles table doesn't exist, inform the user
      if (
        profileError.message.includes("relation") &&
        profileError.message.includes("profiles")
      ) {
        console.log(
          `\n   ⚠️  IMPORTANT: The 'profiles' table does not exist in your database.`,
        );
        console.log(
          `   📝 This may be expected if your schema only uses 'customers' table.`,
        );
        console.log(
          `   💡 Alternative approach: Insert admin user directly into database using SQL.\n`,
        );
        throw new Error("Profiles table not found - check database schema");
      }
      throw profileError;
    }

    console.log(`   ✓ Profile created/updated:`, profileData?.email, "\n");

    // Step 4: Verify login works
    console.log(`4️⃣  Verifying admin login...`);
    const { data: session, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

    if (loginError) {
      console.error(`   ❌ Login verification failed:`, loginError);
      throw loginError;
    }

    console.log(`   ✓ Login successful\n`);

    // Step 5: Verify profile retrieval
    console.log(`5️⃣  Verifying profile retrieval...`);
    const { data: retrievedProfile, error: retrieveError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", ADMIN_EMAIL)
      .single();

    if (retrieveError) {
      console.error(`   ❌ Profile retrieval failed:`, retrieveError);
      throw retrieveError;
    }

    console.log(`   ✓ Profile retrieved successfully\n`);

    // Summary
    console.log(`✅ Admin user seed completed successfully!\n`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📋 Admin Credentials:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     admin`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`🧪 Test login with:\n`);
    console.log(`   POST http://localhost:3000/auth/login`);
    console.log(`   {`);
    console.log(`     "email": "${ADMIN_EMAIL}",`);
    console.log(`     "password": "${ADMIN_PASSWORD}"`);
    console.log(`   }\n`);
    console.log(`📖 For more testing info, see: TESTING_GUIDE.md`);
    console.log(`🔐 For security setup details, see: AUTHENTICATION_SETUP.md\n`);
  } catch (error) {
    console.error(`\n❌ Seed failed:`, error.message);
    console.error(`\n📝 Troubleshooting tips:`);
    console.error(`   1. Ensure .env is configured with Supabase credentials`);
    console.error(`   2. Run: npm install`);
    console.error(`   3. Check Supabase dashboard for database status`);
    console.error(`   4. Verify profiles table exists (run: supabase db push)\n`);
    process.exit(1);
  }
}

// Run the seed
seedAdminUser();
