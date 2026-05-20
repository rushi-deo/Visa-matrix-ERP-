# Deployment Guide - Visa Matrix RBAC Upgrade

## Pre-Deployment Checklist

- [ ] All code changes committed
- [ ] Database backup created
- [ ] Team notified of maintenance window
- [ ] Test environment verified
- [ ] Rollback plan ready

---

## Step 1: Database Migration

### Using Supabase CLI

```bash
cd backend

# Verify pending migrations
supabase migration list

# Run migration
supabase migration up

# Verify migration applied
supabase db show
```

### Manual SQL (via Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy entire content of `backend/supabase/migrations/20260515_rbac_schema.sql`
4. Execute

The migration will:
- Create `permissions` table (40+ system permissions)
- Create `user_roles` table
- Create `role_permissions` table
- Insert default permissions
- Assign default permissions to existing roles

---

## Step 2: Verify Migration

```sql
-- Check permissions created
SELECT COUNT(*) as permission_count FROM public.permissions;
-- Expected: 40+

-- Check table structure
\dt public.permissions
\dt public.user_roles
\dt public.role_permissions

-- Check default data
SELECT COUNT(*) FROM public.role_permissions;
-- Expected: >0 (admin/manager/agent/customer permissions assigned)
```

---

## Step 3: Deploy Code Changes

### Code Updates
1. Pull all changes from git
2. `backend/src/middleware/rbac.middleware.js` - NEW
3. `backend/src/middleware/index.js` - NEW
4. Updated 8 existing files (see IMPLEMENTATION_SUMMARY.md)

### Install/Verify Dependencies
```bash
cd backend
npm install
# All dependencies already in package.json
```

### Restart Backend
```bash
# Development
npm run dev

# Production
npm start
```

---

## Step 4: Test Login Flow

### Test 1: User Login with Permissions

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",  // JWT with permissions
    "user": { ... },
    "session": { ... }
  }
}
```

### Test 2: Decode JWT

Copy the token and verify at https://jwt.io using your JWT_SECRET

**Expected Payload**:
```json
{
  "sub": "user-uuid",
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "Admin",
  "permissions": ["applications:view", "users:view", ...]
}
```

### Test 3: Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "role": "Admin",
    "permissions": ["applications:view", "users:view", ...]
  }
}
```

### Test 4: Protected Route

```bash
# Should succeed
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Should fail (403 Forbidden)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

---

## Step 5: Verify Backward Compatibility

### Test Old Middleware Still Works

Old code using legacy imports should continue working:

```javascript
// These should all still work
import authenticate from "../../middleware/auth.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import authorizeRoles from "../../middleware/authorizeRoles.js";
import authorizePermissions from "../../middleware/permissionMiddleware.js";
```

Test one existing route using old middleware:
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

Should work as before ✅

---

## Step 6: Monitor Logs

Check for errors:
```bash
# In another terminal
tail -f backend/backend-dev.log

# Look for these error patterns
# - "Authentication error"
# - "Authorization error"
# - SQL errors
```

Common issues:
- "Invalid token" → JWT_SECRET mismatch
- "Permission denied" → user_roles entry missing
- "Token expired" → JWT_EXPIRES_IN too short

---

## Step 7: Frontend Integration

### Update Frontend Login

```javascript
// Store JWT and permissions
const response = await loginAPI(email, password);
localStorage.setItem('token', response.token);
localStorage.setItem('permissions', JSON.stringify(response.permissions || []));
```

### Update Frontend to Use /api/auth/me

```javascript
// On app startup
const response = await fetch('/api/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
const { permissions } = await response.data;

// Store for sidebar rendering
setUserPermissions(permissions);
```

### Build Dynamic Sidebar

```javascript
const menuItems = [
  { title: 'Users', route: '/users', permission: 'users:view' },
  { title: 'Invoices', route: '/invoices', permission: 'invoices:view' },
  { title: 'Reports', route: '/reports', permission: 'reports:view' },
];

return menuItems.filter(item => 
  userPermissions.includes(item.permission)
);
```

---

## Step 8: Rollback Plan (if needed)

### Quick Rollback to Previous Code

```bash
# Revert to previous commit
git revert HEAD~7  # Revert last 7 commits with RBAC changes

# Restart backend
npm start
```

### Database Rollback

```bash
# Drop new tables (careful!)
supabase migration reset  # Resets all migrations

# OR manually drop new tables
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
```

⚠️ Only use if absolutely necessary

---

## Post-Deployment

### Updates Required

1. **Update API Documentation** - Add new endpoints:
   - GET /api/auth/me (returns permissions)

2. **Update Frontend** - Implement permission-based UI:
   - Fetch permissions from /api/auth/me
   - Render sidebar based on permissions

3. **Update Admin Panel** - Add role/permission management:
   - View users and their roles
   - Assign permissions to roles
   - Audit permission changes

### Optional Improvements

1. Add permission caching layer (Redis)
2. Implement permission audit logging
3. Add admin endpoints for role/permission management
4. Add permission request workflow for dynamic permissions

---

## Monitoring

### Key Metrics to Track

- Authentication errors (should be < 0.1%)
- Authorization denials (track trends)
- Token expiration errors (monitor if JWT_EXPIRES_IN is right)
- Database query performance (permission lookups at login)

### Alerts to Set Up

```sql
-- Alert if auth errors spike
SELECT COUNT(*) FROM logs WHERE level='ERROR' AND message LIKE '%auth%';

-- Alert if permission denials increase
SELECT COUNT(*) FROM logs WHERE level='WARN' AND message LIKE '%Permission denied%';

-- Alert if logins are failing
SELECT COUNT(*) FROM logs WHERE level='ERROR' AND message LIKE '%Invalid token%';
```

---

## FAQ

**Q: Do existing users need to log in again?**
A: Yes. Permissions are loaded at login time. Existing tokens won't have permissions until user logs in again.

**Q: What if a user's permissions change?**
A: New permissions take effect after next login. Current token won't reflect changes.

**Q: How do I add new permissions?**
A: Add to `permissions` table, then assign to roles via `role_permissions` table.

**Q: Can I use both old and new middleware?**
A: Yes! Old imports delegate to new system. Mix-and-match is safe.

**Q: What if permission loading fails during login?**
A: Fallback: JWT is created with empty permissions array [], user gets in but may be restricted.

**Q: How do I migrate existing role assignments?**
A: Add entries to `user_roles` table mapping users to roles in `roles` table.

---

## Success Criteria

✅ All auth tests passing  
✅ Backward compatibility verified  
✅ No increase in error rates  
✅ JWT tokens include permissions  
✅ /api/auth/me returns permissions  
✅ Protected routes enforce permissions  
✅ Frontend can access permission list  
✅ Role-based sidebar works  

---

## Support

For issues during deployment:

1. **Check Logs**
   ```bash
   tail -f backend/backend-dev.log | grep -i auth
   ```

2. **Verify Database**
   ```sql
   SELECT * FROM public.permissions LIMIT 5;
   SELECT * FROM public.user_roles LIMIT 5;
   SELECT * FROM public.role_permissions LIMIT 5;
   ```

3. **Test Token**
   - Paste JWT at jwt.io
   - Verify payload structure
   - Check expiration time

4. **Debug Middleware**
   ```javascript
   // Add to rbac.middleware.js
   console.log('Auth user:', req.user);
   console.log('Permissions:', req.user?.permissions);
   ```

5. **Check Imports**
   ```bash
   grep -r "from.*auth\.js" backend/src/
   # Should use new rbac.middleware.js
   ```

---

**Deployment Complete!** 🎉

Your Visa Matrix backend now has enterprise-grade dynamic RBAC.

Questions? See RBAC_IMPLEMENTATION.md for full documentation.
