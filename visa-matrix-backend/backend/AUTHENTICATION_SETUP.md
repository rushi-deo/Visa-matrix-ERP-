# Authentication System Setup and Admin User Configuration

## Overview

The Visa Matrix ERP backend uses:

- **Supabase Auth** for user authentication (JWT-based)
- **PostgreSQL** with `profiles` table for storing user profile data
- **Role-Based Access Control (RBAC)** for authorization
- **JWT Tokens** for stateless authentication

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Frontend/Client                                          │
│ (sends email + password)                               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Express Backend                                          │
│ POST /auth/login                                         │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────────┐       ┌──────────────────────┐
│ Supabase Auth        │       │ PostgreSQL           │
│ - Verify credentials │       │ - profiles table     │
│ - Issue session      │       │ - roles table        │
│ - JWT validation     │       │ - permissions table  │
└──────────────────────┘       └──────────────────────┘
        │                                 │
        └────────────────┬────────────────┘
                         │
                         ▼
                    JWT Token + Profile
                         │
                         ▼
                  Include in responses
```

## Database Schema

### profiles Table

Stores user profile information linked to Supabase Auth users:

```sql
create table public.profiles (
  id uuid primary key,                    -- Profile ID
  auth_user_id uuid,                      -- Links to Supabase Auth user ID
  full_name text,                         -- User's full name
  email text unique,                      -- Email (unique)
  phone text,                             -- Phone number
  role text default 'user',               -- Role: admin, manager, agent, customer
  is_active boolean default true,         -- Account status
  created_at timestamptz,                 -- Creation timestamp
  updated_at timestamptz                  -- Last update timestamp
);
```

### roles Table

Defines available roles and permissions:

```sql
-- Existing roles table (from migrations)
public.roles:
  - id (uuid)
  - code (text): 'admin', 'manager', 'agent', 'customer'
  - name (text): Display name
  - description (text)
```

### user_roles Table (RBAC)

Links users to roles:

```sql
public.user_roles:
  - id (uuid)
  - user_id (uuid) -> references profiles(id)
  - role_id (uuid) -> references roles(id)
```

## Authentication Flow

### 1. Login Flow

```
User submits credentials
        ↓
Server calls: supabase.auth.signInWithPassword()
        ↓
Supabase validates credentials
        ↓
Returns session with auth tokens
        ↓
Server queries: profiles table for user profile
        ↓
Profile contains role information
        ↓
Server signs JWT token with role + permissions
        ↓
Return token + user data to client
```

### 2. Request Flow (Authenticated)

```
Client sends: GET /resource with Authorization: Bearer {JWT}
        ↓
Server authenticateUser middleware validates JWT
        ↓
Extract user info from JWT: (userId, email, role)
        ↓
Attach to req.user + req.auth
        ↓
Optional: authorize middleware checks role
        ↓
Route handler processes request
```

## Setup Steps

### Step 1: Create profiles Table

Apply the migration that creates the profiles table:

```bash
supabase db push
```

Or manually run the SQL:

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

### Step 2: Create Admin User

Run the automated seed script:

```bash
npm run seed:admin
```

This will:

1. Check if admin user exists in Supabase Auth
2. Create auth user if needed
3. Create profile record in profiles table
4. Verify login works
5. Display credentials

### Step 3: Verify Setup

Test the admin login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@visamatrix.com",
    "password": "admin123"
  }'
```

Expected response includes:

- `token`: JWT token for authenticated requests
- `user.role`: Should be "admin"
- `user.is_active`: Should be true

## Admin User Account

**Credentials:**

- Email: `admin@visamatrix.com`
- Password: `admin123`
- Role: `admin`

**Capabilities:**

- Access all routes
- Full RBAC permissions
- Can manage other users
- Can modify roles and permissions

## Key Files

### Authentication Module

- `src/modules/auth/auth.controller.js` - Request handlers
- `src/modules/auth/auth.service.js` - Business logic
- `src/modules/auth/auth.repository.js` - Database queries
- `src/modules/auth/auth.routes.js` - Route definitions

### Middleware

- `src/middleware/auth.js` - `authenticateUser` middleware
- `src/middleware/rbac.js` - `authorize` middleware
- `src/middleware/rbac.middleware.js` - `authenticateToken` middleware

### Configuration

- `src/config/supabase.js` - Supabase client setup
- `src/config/env.js` - Environment variables

### Database

- `supabase/migrations/20260515_rbac_schema.sql` - RBAC tables
- `supabase/migrations/20260518_create_profiles_table.sql` - Profiles table

### Seeding

- `seed-admin.js` - Admin user seed script
- `ADMIN_SEED.md` - Seeding instructions
- `TESTING_GUIDE.md` - Testing guide

## Environment Variables

Required in `.env`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/visa_matrix
```

## Common Tasks

### Create a New User

```javascript
const result = await register({
  email: "user@example.com",
  password: "secure_password",
  fullName: "User Name",
  role: "agent", // Cannot be "admin" (must be provisioned)
});
```

### Assign a Role to User

```sql
insert into public.user_roles (user_id, role_id)
select
  (select id from public.profiles where email = 'user@example.com') as user_id,
  (select id from public.roles where code = 'manager') as role_id;
```

### Check User Permissions

```sql
select
  p.email,
  r.name as role,
  string_agg(perm.name, ', ') as permissions
from public.profiles p
left join public.user_roles ur on p.id = ur.user_id
left join public.roles r on ur.role_id = r.id
left join public.role_permissions rp on r.id = rp.role_id
left join public.permissions perm on rp.permission_id = perm.id
where p.email = 'admin@visamatrix.com'
group by p.email, r.name;
```

### Reset Admin Password

**Using Supabase Dashboard:**

1. Go to Authentication → Users
2. Find `admin@visamatrix.com`
3. Click "Reset password"

**Using Seed Script:**

```bash
# Delete profile
DELETE FROM public.profiles WHERE email = 'admin@visamatrix.com';

# Re-run seed
npm run seed:admin
```

## Security Best Practices

✅ **Do:**

- Use strong passwords in production
- Change default admin password immediately
- Enable MFA for admin accounts
- Rotate JWT secrets regularly
- Use HTTPS in production
- Validate all inputs
- Log all authentication attempts
- Monitor for suspicious activity

❌ **Don't:**

- Expose JWT secrets in logs
- Send credentials in URLs
- Store passwords in plaintext
- Share admin credentials
- Use same password across environments
- Disable SSL/TLS verification
- Run migrations manually in production (use proper CI/CD)

## Troubleshooting

### Login Returns "Invalid email or password"

**Check:**

1. ✓ Admin exists in Supabase Auth
   - Supabase Dashboard → Authentication → Users
   - Email should be: `admin@visamatrix.com`

2. ✓ Admin profile exists in database
   - Run: `SELECT * FROM public.profiles WHERE email = 'admin@visamatrix.com';`
   - Should return one record

3. ✓ Password is exactly: `admin123`
   - Case-sensitive
   - Exact match required

4. ✓ Supabase connection is working
   - Check: `src/config/env.js`
   - Verify SUPABASE_URL and keys

### JWT Token Not Working

**Check:**

1. ✓ Token format: `Bearer {token}`
   - Must include "Bearer " prefix
   - One space between Bearer and token

2. ✓ Token not expired
   - Check JWT_EXPIRES_IN in .env
   - Verify system time is correct

3. ✓ JWT_SECRET matches both token signing and verification

4. ✓ Authorization header is correctly capitalized
   - Must be: `Authorization` (not `authorization`)

### Profile Table Not Found

**Solution:**

```bash
# Apply migrations
supabase db push

# Or create manually
# See: supabase/migrations/20260518_create_profiles_table.sql
```

## Next Steps

1. ✅ **Seed Admin User**

   ```bash
   npm run seed:admin
   ```

2. ✅ **Test Login**
   - See: TESTING_GUIDE.md
   - Use Postman collection provided

3. ✅ **Create Additional Users**
   - Register via API
   - Assign roles via database

4. ✅ **Test RBAC**
   - Access different routes with different roles
   - Verify permissions enforcement

5. ✅ **Set Up Monitoring**
   - Log all auth attempts
   - Alert on failed logins
   - Track permission changes

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT (JSON Web Tokens)](https://jwt.io/)
- [RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control)
- [Express Authentication Patterns](https://expressjs.com/)
- [PostgreSQL JSON](https://www.postgresql.org/docs/current/datatype-json.html)
