# Enterprise RBAC System - Visa Matrix ERP

## ✅ Implementation Complete

A comprehensive, database-driven Role-Based Access Control (RBAC) system has been successfully implemented for the Visa Matrix ERP. This system provides enterprise-grade permission management with full integration across backend and frontend.

---

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Visa Matrix RBAC System                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │             Database Layer (Supabase)               │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ profiles ──→ user_roles ──→ roles                   │ │
│  │                             ├→ role_permissions     │ │
│  │                             └→ permissions          │ │
│  └──────────────────────────────────────────────────────┘ │
│                          ↕                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           Backend Middleware Layer                  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ authenticateUser                                     │ │
│  │   ↓ (validates JWT)                                 │ │
│  │ authorizeRoles ("Admin", "Super Admin")             │ │
│  │   ↓ (checks role)                                   │ │
│  │ authorizePermissions ("manage_users")               │ │
│  │   ↓ (checks permissions from JWT)                   │ │
│  │ Route Handler                                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                          ↕                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │        Frontend - React Context & Hooks             │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ AuthContext (user, permissions, role)               │ │
│  │   ├── useAuth() - core auth methods                 │ │
│  │   ├── usePermissions() - permission checks          │ │
│  │   └── useRBAC() - admin API calls                   │ │
│  │                                                      │ │
│  │ Protected Components:                               │ │
│  │   ├── ProtectedRoute (role & permission checks)     │ │
│  │   ├── SidebarNav (dynamic menu filtering)           │ │
│  │   └── RolePermissionMatrix (admin UI)               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### ✨ Backend Features

- **JWT Authentication**: Stateless auth with role and permissions in token
- **Middleware Chain**: Multi-layer protection (auth → role → permission)
- **Dynamic Permission Loading**: Permissions fetched from DB during login
- **Admin APIs**: Full CRUD for roles, permissions, and role-permission assignments
- **User Management**: Assign/update roles for users
- **Super Admin Bypass**: Super Admin role has all permissions automatically
- **Error Handling**: Proper 401/403 responses with clear messages

### ✨ Frontend Features

- **Permission Hooks**: `usePermissions()` for component-level checks
- **Role-Based Sidebar**: Menu items hide based on role and permissions
- **Protected Routes**: Redirect unauthorized users to login/dashboard
- **Role Permission Matrix**: Interactive admin UI for managing permissions
- **Session Restoration**: Automatic session restore on app reload
- **TypeScript Support**: Full type safety for roles and permissions
- **React Query Integration**: Cached RBAC data with automatic refresh

---

## Component Files Overview

### Backend

```
backend/src/
├── middleware/
│   ├── auth.js                      # JWT validation
│   ├── authorizeRoles.js            # Role checking
│   └── permission.middleware.js     # Permission checking
│
├── modules/
│   ├── admin/
│   │   ├── admin.controller.js      # Admin endpoints
│   │   ├── admin.routes.js          # Protected routes
│   │   ├── role.repository.js       # Role DB queries
│   │   └── permission.repository.js # Permission DB queries
│   │
│   ├── auth/
│   │   └── auth.service.js          # Enhanced login (+ permissions)
│   │
│   └── users/
│       └── user.repository.js       # User management (+ role updates)
```

### Frontend

```
frontend/src/
├── context/
│   └── AuthContext.tsx              # Auth + permission methods
│
├── hooks/
│   ├── useAuth.ts                   # Core auth hook
│   ├── usePermissions.ts            # Permission checking hook
│   └── useRBAC.ts                   # React Query RBAC hooks
│
├── components/
│   ├── common/
│   │   └── ProtectedRoute.tsx       # Route protection
│   ├── admin/
│   │   └── RolePermissionMatrix.tsx # Permission matrix UI
│   └── layout/
│       └── SidebarNav.tsx           # Dynamic sidebar
│
├── config/
│   └── appConfig.ts                 # Navigation with permissions
│
├── services/
│   └── adminService.ts              # RBAC API calls
│
├── types/
│   └── auth.ts                      # Auth & permission types
│
└── utils/
    └── normalizers.ts               # Auth data normalization
```

---

## API Reference

### Authentication

```http
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "Admin",
    "permissions": ["manage_users", "manage_roles"]
  }
}
```

### Roles

```http
GET /api/admin/roles
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "role-uuid",
        "name": "Admin",
        "description": "Administrator role",
        "permissionCount": 5
      }
    ]
  }
}

---

GET /api/admin/roles/:id/permissions
Authorization: Bearer <JWT_TOKEN>
Requires: manage_roles permission

Response:
{
  "success": true,
  "data": {
    "role": { "id": "...", "name": "Admin" },
    "permissions": [
      { "id": "perm-uuid", "name": "manage_users" }
    ]
  }
}

---

POST /api/admin/roles/:id/permissions
Authorization: Bearer <JWT_TOKEN>
Requires: manage_roles permission

Body:
{
  "permissionId": "permission-uuid"
}

Response:
{
  "success": true,
  "data": { "roleId": "...", "permissionId": "..." }
}

---

DELETE /api/admin/roles/:id/permissions/:permissionId
Authorization: Bearer <JWT_TOKEN>
Requires: manage_roles permission

Response:
{
  "success": true,
  "data": { "roleId": "...", "permissionId": "..." }
}
```

### Users

```http
GET /api/admin/users
Authorization: Bearer <JWT_TOKEN>
Requires: manage_users permission

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "Case Manager"
      }
    ]
  }
}
```

---

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'Employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

### Roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP
);
```

### Permissions Table

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP
);
```

### User Roles Table

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id),
  role_id UUID REFERENCES roles(id),
  assigned_at TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);
```

### Role Permissions Table

```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  assigned_at TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);
```

---

## Roles & Permissions

### Predefined Roles

| Role             | Purpose              | Default Permissions                |
| ---------------- | -------------------- | ---------------------------------- |
| **Super Admin**  | System administrator | All (auto-granted)                 |
| **Admin**        | Organization admin   | All except role creation           |
| **HR**           | Human resources      | manage_employees, manage_documents |
| **Finance**      | Financial operations | manage_payments, view_reports      |
| **Sales**        | Sales operations     | manage_crm                         |
| **Case Manager** | Visa case handling   | manage_visas, edit_applications    |
| **Employee**     | Regular user         | Limited access                     |

### Available Permissions

| Permission            | Description                               |
| --------------------- | ----------------------------------------- |
| **manage_users**      | Create, edit, delete users                |
| **manage_roles**      | Create and edit roles, assign permissions |
| **assign_roles**      | Assign roles to users                     |
| **manage_employees**  | HR operations                             |
| **manage_visas**      | Visa case management                      |
| **manage_documents**  | Document operations                       |
| **manage_payments**   | Payment processing                        |
| **view_reports**      | Access analytics and reports              |
| **manage_crm**        | Customer relationship operations          |
| **edit_applications** | Application editing                       |

---

## Usage Patterns

### Backend - Protecting Routes

#### Role-Based Protection

```javascript
import { Router } from "express";
import { authenticateUser } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

// Only admins can access
router.get(
  "/admin/dashboard",
  authenticateUser,
  authorizeRoles("Admin", "Super Admin"),
  adminDashboardHandler,
);
```

#### Permission-Based Protection

```javascript
import { authorizePermissions } from "../middleware/permission.middleware.js";

// Only users with manage_users permission
router.post(
  "/admin/users",
  authenticateUser,
  authorizePermissions("manage_users"),
  createUserHandler,
);
```

#### Combined Protection

```javascript
// Must be Admin role AND have manage_roles permission
router.delete(
  "/admin/roles/:id",
  authenticateUser,
  authorizeRoles("Admin", "Super Admin"),
  authorizePermissions("manage_roles"),
  deleteRoleHandler,
);
```

### Frontend - Permission Checks

#### Using useAuth Hook

```typescript
import { useAuth } from "../hooks/useAuth";

export function AdminPanel() {
  const { user, hasPermission, hasAnyPermission } = useAuth();

  // Single permission check
  if (!hasPermission("manage_users")) {
    return <div>Access Denied</div>;
  }

  // Multiple permissions check (ANY)
  if (!hasAnyPermission(["manage_users", "assign_roles"])) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Your role: {user?.role}</p>
      <p>Your permissions: {user?.permissions?.join(", ")}</p>
    </div>
  );
}
```

#### Using usePermissions Hook

```typescript
import { usePermissions } from "../hooks/usePermissions";

export function Dashboard() {
  const { can, canAny, canAll } = usePermissions();

  return (
    <div>
      {can("manage_users") && <UserManagementSection />}
      {can("view_reports") && <ReportsSection />}
      {canAny(["manage_payments", "view_reports"]) && <FinanceSection />}
    </div>
  );
}
```

#### Protected Routes

```typescript
import { ProtectedRoute } from "../components/common/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Role-based protection */}
      <Route
        element={
          <ProtectedRoute requiredRoles={["Admin", "Super Admin"]} />
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Permission-based protection */}
      <Route
        element={
          <ProtectedRoute requiredPermissions={["manage_users"]} />
        }
      >
        <Route path="/users" element={<UserManagement />} />
      </Route>

      {/* Combined */}
      <Route
        element={
          <ProtectedRoute
            requiredRoles={["Admin"]}
            requiredPermissions={["manage_roles"]}
          />
        }
      >
        <Route path="/roles" element={<RoleManagement />} />
      </Route>
    </Routes>
  );
}
```

#### Dynamic Sidebar

```typescript
// SidebarNav automatically filters based on permissions
// Navigation items with requiredPermission are hidden if user doesn't have it

// From appConfig.ts:
{
  label: "Payments",
  icon: CircleDollarSign,
  to: "/payments",
  roles: ["Admin", "Finance"],
  requiredPermission: "manage_payments"  // ← Filters automatically
}
```

---

## Login Flow

### Step-by-Step

1. **User Submits Credentials**

   ```javascript
   POST / api / auth / login;
   Body: {
     (email, password);
   }
   ```

2. **Backend Validates & Fetches Data**
   - Validates credentials with Supabase Auth
   - Fetches user profile from `profiles` table
   - Queries `user_roles` to get role
   - Fetches permissions from `role_permissions` table

3. **Generate JWT with Permissions**

   ```javascript
   jwt.sign(
     {
       userId: user.id,
       email: user.email,
       role: "Admin",
       permissions: ["manage_users", "manage_roles"],
       sub: user.id,
     },
     SECRET,
   );
   ```

4. **Return to Frontend**

   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "id": "uuid",
       "email": "admin@example.com",
       "role": "Admin",
       "permissions": ["manage_users", "manage_roles"]
     }
   }
   ```

5. **Frontend Stores & Uses**
   - Saves JWT to localStorage
   - Stores user info in AuthContext
   - Filters sidebar based on permissions
   - Protects routes based on role/permissions

6. **On App Reload**
   - Restores JWT from localStorage
   - Calls `GET /api/auth/me` to validate
   - Restores AuthContext state
   - User experience seamless

---

## Security Best Practices

### ✅ Implemented

- ✅ JWT-based stateless authentication
- ✅ Bearer token validation on every request
- ✅ Role and permission checks in middleware
- ✅ 401 for invalid/expired tokens
- ✅ 403 for insufficient permissions
- ✅ Permissions stored in JWT (no repeat DB calls)
- ✅ Super Admin bypass with proper validation

### 🔐 Recommendations

- Use HTTPS only in production
- Set `secure` flag on JWT cookie (if using cookies)
- Implement token refresh mechanism
- Add audit logging for permission changes
- Regularly rotate JWT secrets
- Implement rate limiting on auth endpoints
- Use environment variables for secrets
- Add IP whitelisting for admin endpoints
- Implement 2FA for sensitive operations
- Monitor for suspicious permission changes

---

## Testing Guide

### Backend Tests

```javascript
// Test authentication middleware
test("authenticateUser rejects missing token", async () => {
  const req = { headers: {} };
  const res = statusSpy();
  authenticateUser(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});

// Test role authorization
test("authorizeRoles rejects non-admin", async () => {
  const req = { user: { userId: "1", role: "Employee" } };
  const roleCheck = authorizeRoles("Admin");
  roleCheck(req, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
});

// Test permission authorization
test("authorizePermissions checks JWT permissions", async () => {
  const req = { user: { permissions: ["manage_users"] } };
  const permCheck = authorizePermissions("manage_roles");
  permCheck(req, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
});
```

### Frontend Tests

```typescript
// Test usePermissions hook
test("usePermissions.can() checks single permission", () => {
  const { result } = renderHook(() => usePermissions(), {
    wrapper: TestAuthProvider
  });

  expect(result.current.can("manage_users")).toBe(true);
  expect(result.current.can("manage_payments")).toBe(false);
});

// Test ProtectedRoute component
test("ProtectedRoute redirects without permission", () => {
  render(
    <ProtectedRoute requiredPermissions={["manage_users"]}>
      <div>Protected Content</div>
    </ProtectedRoute>,
    { wrapper: TestProviders }
  );

  expect(screen.getByText("Access Denied")).toBeInTheDocument();
});
```

---

## Troubleshooting

### Issue: User doesn't see menu items

**Solution**: Check:

1. User has correct role assigned in `user_roles` table
2. Role has permissions in `role_permissions` table
3. Navigation item has correct `requiredPermission` in appConfig
4. Frontend session restored with `GET /api/auth/me`

### Issue: Permission check fails on backend

**Solution**:

1. Verify JWT token is valid: Check expiration date
2. Ensure permissions array in JWT matches DB: Re-login to refresh
3. Check middleware chain order: Auth → Role → Permission

### Issue: Sidebar shows unauthorized items

**Solution**:

1. Clear localStorage and re-login
2. Check browser console for permission errors
3. Verify usePermissions hook is working with `can()` method
4. Check SidebarNav component filtering logic

### Issue: "Insufficient permissions" error

**Solution**:

1. Check user role in database
2. Verify role has permission in `role_permissions`
3. Logout and login again to refresh JWT
4. Check permission name spelling (case-sensitive)

---

## Future Enhancements

- [ ] Dynamic role creation UI
- [ ] Permission groups/modules
- [ ] Time-based role assignments
- [ ] API key management
- [ ] OAuth2/SAML integration
- [ ] 2FA for sensitive operations
- [ ] Audit logging UI
- [ ] Permission templates
- [ ] Role hierarchy/inheritance
- [ ] FlutterFlow mobile app support

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **JWT**: https://jwt.io
- **Express Middleware**: https://expressjs.com/en/guide/writing-middleware.html
- **React Query**: https://tanstack.com/query/latest
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## Checklist for Deployment

- [ ] Database: All roles and permissions seeded
- [ ] Environment: `JWT_SECRET` configured
- [ ] Backend: All middleware endpoints tested
- [ ] Frontend: Permission checks working
- [ ] CORS: Frontend and backend URLs configured
- [ ] API: `VITE_API_BASE_URL` set correctly
- [ ] Security: HTTPS enabled in production
- [ ] Logging: Error logging configured
- [ ] Monitoring: Track failed auth attempts
- [ ] Testing: Full test suite passing

---

**Version**: 1.0.0 | **Last Updated**: 2026-05-15

**Visa Matrix ERP - Enterprise RBAC System** ✨
