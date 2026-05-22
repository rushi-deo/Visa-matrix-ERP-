# Enterprise Authentication & Access Control System - Setup Guide

## Overview
Complete enterprise-level authentication and access control system for Visa Matrix ERP using Supabase, React, and Node.js.

## Features Implemented

### 1. Database Schema
- **Organizations** - Multi-tenant support
- **Departments** - Organizational structure
- **Roles** - Role-based access control with levels
- **Permissions** - Granular permission management
- **Profiles** - Enhanced employee profiles with status tracking
- **Sessions** - Active session tracking
- **Login History** - Login audit trail
- **Audit Logs** - Complete action audit trail
- **Password Reset Tokens** - Secure password reset flow

### 2. Authentication System
- Email/password login
- Forgot password with email reset link
- Reset password flow
- Change password
- Session management
- Account locking after failed attempts
- Login history tracking

### 3. RBAC System
- **Roles**: Super Admin, Admin, HR Manager, Visa Officer, Finance Manager, Branch Manager, Employee
- **Permissions**: 50+ granular permissions across 11 modules
- **Role-Permission Mapping**: Flexible role permission assignment
- **Direct Employee Permissions**: Override permissions for specific employees

### 4. Frontend Components

#### Pages
- `LoginPageNew.tsx` - Professional login page
- `ForgotPasswordPageNew.tsx` - Forgot password page
- `EmployeeManagement.tsx` - Employee CRUD and management
- `RoleManagementPage.tsx` - Role and permission management

#### Components
- `ProtectedRouteNew.tsx` - Route protection based on roles/permissions
- `PermissionGate` - Conditional rendering based on permissions
- `RoleGate` - Conditional rendering based on roles
- `SuperAdminOnly` - Super Admin-only content

#### Services
- `authService.ts` - Enhanced authentication service
- `sessionService.ts` - Session management service

### 5. Backend Infrastructure

#### Middleware
- `authenticationMiddleware.js` - JWT validation and user context
- `requireRole()` - Role-based route protection
- `requirePermission()` - Permission-based route protection
- `requireSuperAdmin()` - Super Admin-only protection

#### Controllers
- `employeeController.js` - Employee management CRUD operations

#### Routes
- `employeeRoutes.js` - Employee management endpoints

## Implementation Steps

### Step 1: Deploy Database Migration
```bash
# Run migration on Supabase
supabase db push migrations/20260522_enterprise_auth_system.sql
```

### Step 2: Update Backend

1. Add routes to main server.js:
```javascript
import employeeRoutes from "./routes/employeeRoutes.js";
app.use("/api/employees", employeeRoutes);
```

2. Update authentication endpoints in auth.service.js to use new session tracking

### Step 3: Update Frontend

1. Replace Auth context with enhanced implementation
2. Update App.tsx to use new protected routes
3. Update sidebar to filter navigation based on permissions

### Step 4: Update Sidebar Navigation

The sidebar should filter items based on user permissions. Key points:
- Items with `requiredPermission` are hidden if user lacks permission
- Items with `roles` are hidden if user doesn't have required role
- Update SidebarNav.tsx to respect the module property

### Step 5: Configure API Endpoints

Update config/api.ts:
```typescript
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    register: "/api/auth/register",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    changePassword: "/api/auth/change-password",
    currentUser: "/api/auth/me",
  },
  employees: {
    list: "/api/employees",
    get: (id) => `/api/employees/${id}`,
    create: "/api/employees",
    update: (id) => `/api/employees/${id}`,
    status: (id) => `/api/employees/${id}/status`,
    lock: (id) => `/api/employees/${id}/lock`,
    permissions: (id) => `/api/employees/${id}/permissions`,
  },
  roles: {
    list: "/api/roles",
    get: (id) => `/api/roles/${id}`,
    create: "/api/roles",
    update: (id) => `/api/roles/${id}`,
    permissions: (id) => `/api/roles/${id}/permissions`,
  },
};
```

## Testing

### 1. Create Test Users
```sql
-- Via Supabase CLI or Admin API
INSERT INTO auth.users (email, encrypted_password)
VALUES ('admin@vismamatrix.com', <hashed_password>);

INSERT INTO profiles (id, email, full_name, status, role_id)
VALUES ('<user_id>', 'admin@vismamatrix.com', 'Admin User', 'active', '<super_admin_role_id>');
```

### 2. Test Authentication Flow
1. Login with credentials
2. Verify JWT token in response
3. Check session is created
4. Test logout and session invalidation

### 3. Test RBAC
1. Login as different roles
2. Verify sidebar shows/hides modules
3. Test unauthorized route access
4. Verify permission checks in API

### 4. Test Security Features
1. Failed login attempts lock account
2. Account unlock works
3. Password reset tokens expire
4. Session timeout works
5. Audit logs record all actions

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── employeeController.js      # Employee CRUD
│   ├── middleware/
│   │   └── authenticationMiddleware.js # JWT & role checks
│   ├── routes/
│   │   └── employeeRoutes.js          # Employee API routes
│   └── server.js                       # Main server (needs update)
└── supabase/
    └── migrations/
        └── 20260522_enterprise_auth_system.sql

frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPageNew.tsx           # Login page
│   │   ├── ForgotPasswordPageNew.tsx   # Forgot password
│   │   ├── EmployeeManagement.tsx     # Employee CRUD UI
│   │   └── RoleManagementPage.tsx     # Role/permission UI
│   ├── components/
│   │   └── common/
│   │       └── ProtectedRouteNew.tsx  # Route protection
│   ├── services/
│   │   ├── authService.ts            # Enhanced auth service
│   │   └── sessionService.ts         # Session management
│   └── App.tsx                        # Update routes
```

## Security Best Practices

1. **Session Management**
   - 24-hour session expiry
   - Automatic logout on inactivity
   - Multiple session tracking
   - Invalidate all sessions on logout

2. **Password Security**
   - Force password change on first login
   - Password expiry handling
   - Secure reset token generation
   - Failed attempt lockout

3. **Audit & Compliance**
   - All user actions logged
   - Login history tracked
   - Permission changes audited
   - IP address and device tracking

4. **RLS Policies**
   - Employees see only their own data
   - Managers see subordinate data
   - Super Admin sees all data
   - Organization data isolation

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List employees
- `GET /api/employees/:id` - Get employee
- `POST /api/employees` - Create employee
- `PATCH /api/employees/:id` - Update employee
- `PATCH /api/employees/:id/status` - Change status
- `PATCH /api/employees/:id/lock` - Lock/unlock
- `GET /api/employees/:id/permissions` - Get permissions

### Roles (to be implemented)
- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get role
- `POST /api/roles` - Create role
- `PATCH /api/roles/:id` - Update role
- `POST /api/roles/:id/permissions` - Add permission

### Sessions (to be implemented)
- `GET /api/sessions` - List active sessions
- `DELETE /api/sessions/:id` - Invalidate session

### Audit (to be implemented)
- `GET /api/audit-logs` - List audit logs
- `GET /api/login-history` - List login history

## Next Steps

1. ✅ Database schema created
2. ✅ Backend middleware implemented
3. ✅ Frontend components created
4. ⏳ Backend routes integration (server.js update needed)
5. ⏳ Frontend App.tsx route updates needed
6. ⏳ Sidebar permission filtering implementation
7. ⏳ Session timeout feature implementation
8. ⏳ Password policy implementation
9. ⏳ 2FA/MFA integration (optional)
10. ⏳ LDAP/SSO integration (optional)

## Support & Maintenance

- Review audit logs regularly
- Monitor failed login attempts
- Update permissions as roles change
- Keep session timeout appropriate
- Regular security audits

---

For questions or issues, contact: support@vismamatrix.com
