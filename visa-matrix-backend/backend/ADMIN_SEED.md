# Admin User Seeding Guide

This guide explains how to create a default admin user for testing JWT and RBAC functionality.

## Prerequisites

- Backend server is set up
- Supabase/PostgreSQL database is running
- Environment variables are configured (`.env`)
- Node.js is available

## Admin Credentials

```
Email: admin@visamatrix.com
Password: admin123
Role: admin
```

## Method 1: Automated JavaScript Seed (Recommended)

This method creates the admin user using Supabase Auth and the profiles table.

### Steps:

1. **Ensure the profiles table exists**

   Apply the migration to create the profiles table:

   ```bash
   # The migration is at: supabase/migrations/20260518_create_profiles_table.sql
   # It will be applied automatically when you run supabase migrations
   supabase db push
   ```

2. **Run the seed script**

   ```bash
   npm run seed:admin
   ```

3. **Expected Output:**

   ```
   🌱 Starting admin user seed...

   1️⃣  Checking if admin user exists...
      ✓ Admin user already exists in Supabase Auth

   3️⃣  Creating/updating admin profile...
      ✓ Profile created/updated: admin@visamatrix.com

   4️⃣  Verifying admin login...
      ✓ Login successful

   5️⃣  Verifying profile retrieval...
      ✓ Profile retrieved successfully

   ✅ Admin user seed completed successfully!

   📋 Admin Credentials:
      Email: admin@visamatrix.com
      Password: admin123
      Role: admin
   ```

## Method 2: Direct SQL Insert (Alternative)

If you prefer to use direct SQL, you can insert the admin user directly into the database.

### Steps:

1. **Connect to your Supabase/PostgreSQL database**

2. **Create the profiles table (if it doesn't exist)**

   ```sql
   create table if not exists public.profiles (
     id uuid primary key,
     auth_user_id uuid,
     full_name text,
     email text unique,
     phone text,
     role text default 'user',
     is_active boolean default true,
     created_at timestamptz not null default timezone('utc', now()),
     updated_at timestamptz not null default timezone('utc', now())
   );
   ```

3. **Create auth user in Supabase Auth**

   Using Supabase dashboard:
   - Go to Authentication → Users
   - Click "Create user"
   - Email: `admin@visamatrix.com`
   - Password: `admin123`
   - Confirm email immediately
   - Copy the user ID (UUID)

4. **Insert admin profile**

   Replace `{AUTH_USER_ID}` with the UUID from step 3:

   ```sql
   insert into public.profiles (
     id,
     auth_user_id,
     full_name,
     email,
     role,
     is_active
   )
   values (
     gen_random_uuid(),
     '{AUTH_USER_ID}'::uuid,
     'Admin User',
     'admin@visamatrix.com',
     'admin',
     true
   )
   on conflict (email) do update
   set
     role = 'admin',
     is_active = true;
   ```

## Testing the Admin User

### 1. Start the backend server

```bash
npm run dev
```

### 2. Test login endpoint

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@visamatrix.com",
    "password": "admin123"
  }'
```

### 3. Expected Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "admin@visamatrix.com",
      "full_name": "Admin User",
      "role": "admin",
      "is_active": true
    },
    "session": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "message": "User logged in successfully."
}
```

### 4. Test with the token

Use the returned JWT token in the Authorization header:

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer {TOKEN}"
```

## Troubleshooting

### "Invalid email or password" error

- ✓ Verify the admin user exists in Supabase Auth
- ✓ Verify the profile exists in the profiles table
- ✓ Check that password is exactly: `admin123`

### "User profile not found" error

- ✓ Ensure the profiles table exists
- ✓ Verify the profile record exists in the profiles table
- ✓ Check that auth_user_id matches the Supabase Auth user ID

### Profiles table doesn't exist

Run the migration:

```bash
supabase db push
```

Or create it manually using the SQL in Method 2.

## Security Notes

⚠️ **Important for Production:**

- This admin account is for testing/development only
- Change the password immediately in production
- Consider using stronger passwords
- Implement proper user provisioning workflows
- Enable MFA for admin accounts
- Use environment variables for credentials

## Resetting Admin User

To reset the admin user password:

1. **Using Supabase Dashboard:**
   - Go to Authentication → Users
   - Find admin@visamatrix.com
   - Click "Reset password"

2. **Using SQL:**
   ```sql
   delete from public.profiles where email = 'admin@visamatrix.com';
   ```
   Then re-run the seed script.
