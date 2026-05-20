# Admin User Setup - Quick Reference

## 📋 What This Does

This setup creates a default admin user in your Visa Matrix ERP backend for testing JWT authentication and RBAC (Role-Based Access Control).

**Admin Account:**

- Email: `admin@visamatrix.com`
- Password: `admin123`
- Role: `admin`

## ⚡ Quick Start (3 Steps)

### 1. Apply Database Migration

```bash
cd backend
supabase db push
```

This creates the `profiles` table that stores user profile data.

### 2. Seed Admin User

```bash
npm run seed:admin
```

Expected output:

```
✅ Admin user seed completed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email:    admin@visamatrix.com
   Password: admin123
   Role:     admin
```

### 3. Test Login

```bash
# Start the server
npm run dev

# In another terminal, test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@visamatrix.com",
    "password": "admin123"
  }'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "admin@visamatrix.com",
      "full_name": "Admin User",
      "role": "admin",
      "is_active": true
    }
  }
}
```

## 📚 Documentation Files

| File                                                     | Purpose                                      |
| -------------------------------------------------------- | -------------------------------------------- |
| `ADMIN_SEED.md`                                          | Detailed seeding instructions + alternatives |
| `TESTING_GUIDE.md`                                       | Complete testing guide with curl examples    |
| `AUTHENTICATION_SETUP.md`                                | Architecture + security best practices       |
| `seed-admin.js`                                          | The seed script itself                       |
| `supabase/migrations/20260518_create_profiles_table.sql` | Database migration                           |

## 🏗️ Architecture Overview

```
Login Request
    ↓
Supabase Auth validates credentials
    ↓
Server queries profiles table
    ↓
Server signs JWT token
    ↓
Return token + user info
    ↓
Client uses token for authenticated requests
```

## 🔑 Key Components

### Database (PostgreSQL)

**profiles table** - Stores user profile data:

```sql
- id (UUID)
- auth_user_id (UUID) - Links to Supabase Auth
- email (text, unique)
- full_name (text)
- role (text) - admin, manager, agent, customer
- is_active (boolean)
- created_at, updated_at
```

### Supabase Auth

- Manages user credentials
- Issues JWT tokens
- Validates passwords

### Backend Middleware

- `authenticateUser` - Validates JWT token
- `authorize` - Checks user role/permissions
- Role-based access control (RBAC)

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `supabase db push` completes without errors
- [ ] `npm run seed:admin` completes successfully
- [ ] Admin user shows in Supabase Auth dashboard
- [ ] Login returns valid JWT token
- [ ] Can access protected routes with token
- [ ] Admin user has "admin" role in database

## 🆘 Troubleshooting

### "profiles table not found"

- Run: `supabase db push`
- Check migrations folder

### "Invalid email or password"

- Verify admin exists in Supabase dashboard
- Verify profile exists in database
- Ensure password is exactly: `admin123`

### "User profile not found"

- Verify `seed-admin.js` completed successfully
- Check profiles table has admin record
- Verify auth_user_id matches Supabase user ID

### Seed script fails to run

- Check `.env` has Supabase credentials
- Run: `npm install`
- Check Node.js version: `node --version` (should be >=20)

## 🚀 Next Steps

1. **Test the admin account** - See TESTING_GUIDE.md
2. **Create additional users** - Use the registration endpoint
3. **Assign roles** - Use the database directly or API
4. **Test RBAC** - Access routes with different roles
5. **Set up monitoring** - Log auth attempts

## 🔐 Security Reminders

⚠️ **For Development Only:**

This default admin account is for **testing and development only**.

**Production checklist:**

- [ ] Change admin password immediately
- [ ] Use strong password (min 16 chars, symbols, numbers)
- [ ] Enable Multi-Factor Authentication (MFA)
- [ ] Implement proper user provisioning workflows
- [ ] Use `.env` for all sensitive credentials
- [ ] Rotate JWT secrets regularly
- [ ] Enable HTTPS in production
- [ ] Monitor for suspicious login attempts
- [ ] Log all authentication events

## 📖 Full Documentation

For complete setup instructions and API details:

1. **AUTHENTICATION_SETUP.md** - Full architecture and setup guide
2. **TESTING_GUIDE.md** - Complete testing guide with examples
3. **ADMIN_SEED.md** - Seeding methods and alternatives

## 💡 Common Tasks

### Change Admin Password

```bash
# Via Supabase dashboard:
# 1. Go to Authentication → Users
# 2. Find admin@visamatrix.com
# 3. Click "Reset password"

# OR delete and reseed:
# DELETE FROM public.profiles WHERE email = 'admin@visamatrix.com';
# npm run seed:admin
```

### Create Another Admin User

```bash
# Use the API to register
POST /auth/register
{
  "email": "admin2@visamatrix.com",
  "password": "strong_password",
  "fullName": "Another Admin"
}

# Then manually update role in database
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin2@visamatrix.com';
```

### Check Admin User Details

```bash
# Query the database
SELECT * FROM public.profiles WHERE email = 'admin@visamatrix.com';
SELECT * FROM public.roles WHERE code = 'admin';
```

## 🎯 Testing Commands

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visamatrix.com","password":"admin123"}'

# Get current user (replace TOKEN)
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer {TOKEN}"

# Access admin-only route
curl http://localhost:3000/test/admin-test \
  -H "Authorization: Bearer {TOKEN}"
```

## 📞 Support

For detailed help:

- Check TESTING_GUIDE.md for examples
- See AUTHENTICATION_SETUP.md for architecture
- Review seed-admin.js for implementation details

## ✨ Summary

```
✓ Admin table created
✓ Admin user seeded
✓ JWT authentication working
✓ RBAC enforced
✓ Ready for testing
```

Start testing with: `npm run dev`
