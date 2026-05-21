# Visa Matrix RBAC Implementation Guide

## Overview

The Visa Matrix backend now uses a dynamic **Role-Based Access Control (RBAC)** system powered by Supabase. This consolidates fragmented authentication middleware into a clean, enterprise-grade authorization system.

## Key Features

✅ **Dynamic Permission Loading** - Permissions loaded from Supabase during login  
✅ **JWT-Based Tokens** - Permissions embedded in JWT for stateless auth  
✅ **Unified Middleware** - Single RBAC middleware replaces 5+ scattered files  
✅ **Module-Based Permissions** - Pattern: `{module}:{action}`  
✅ **Role Hierarchy** - Admin, Manager, Agent, Customer with auto-assigned permissions  
✅ **GET /api/auth/me** - Returns user + role + permissions for frontend  
✅ **Backward Compatible** - Existing middleware still works

## Database Schema

### New Tables (created in migration: `20260515_rbac_schema.sql`)

#### `permissions`

```sql
id              uuid primary key
name            text unique      -- e.g., "applications:view"
description     text             -- Human-readable description
module          text             -- e.g., "applications", "users", "invoices"
action          text             -- e.g., "view", "create", "edit", "delete"
created_at      timestamptz
updated_at      timestamptz
```

#### `user_roles`

```sql
id              uuid primary key
user_id         uuid foreign key → profiles.id
role_id         uuid foreign key → roles.id
assigned_at     timestamptz
created_at      timestamptz
updated_at      timestamptz
```

#### `role_permissions` (junction table)

```sql
id              uuid primary key
role_id         uuid foreign key → roles.id
permission_id   uuid foreign key → permissions.id
assigned_at     timestamptz
created_at      timestamptz
updated_at      timestamptz
```

## Supported Modules & Permissions

### Applications

- `applications:view` - View applications
- `applications:create` - Create new applications
- `applications:edit` - Edit applications
- `applications:delete` - Delete applications
- `applications:review` - Review applications

### Users

- `users:view` - View user list
- `users:create` - Create new users
- `users:edit` - Edit user details
- `users:delete` - Delete users
- `users:manage_roles` - Assign/revoke roles

### Invoices

- `invoices:view` - View invoices
- `invoices:create` - Create invoices
- `invoices:edit` - Edit invoices
- `invoices:delete` - Delete invoices
- `invoices:approve` - Approve invoices

### Payments

- `payments:view` - View payments
- `payments:create` - Create payments
- `payments:approve` - Approve payments
- `payments:reject` - Reject payments

### Documents

- `documents:upload` - Upload documents
- `documents:view` - View documents
- `documents:delete` - Delete documents
- `documents:verify` - Verify documents

### Reports

- `reports:view` - View reports
- `reports:export` - Export reports
- `reports:create` - Create reports

### Communications

- `communications:send` - Send communications
- `communications:view` - View communications
- `communications:reply` - Reply to communications

### Visa Rules

- `visa_rules:view` - View visa rules
- `visa_rules:create` - Create visa rules
- `visa_rules:edit` - Edit visa rules
- `visa_rules:delete` - Delete visa rules

### Workflows

- `workflows:view` - View workflows
- `workflows:create` - Create workflows
- `workflows:edit` - Edit workflows
- `workflows:execute` - Execute workflows

## Default Role Permissions

### Admin

- All permissions except `users:delete`, `invoices:delete`, `documents:delete` (safety)

### Manager

- `reports:*`
- `communications:*`
- All `view` permissions

### Agent

- `applications:*`
- `documents:*`
- `communications:*`
- `visa_rules:view`

### Customer

- `applications:view`, `applications:create`
- `documents:view`, `documents:upload`
- `communications:view`, `communications:reply`

## New Middleware API

All middleware is now exported from `middleware/rbac.middleware.js` and re-exported by legacy files for backward compatibility.

### `authenticateToken`

Validates JWT token and extracts user info.

```javascript
import { authenticateToken } from "../../middleware/rbac.middleware.js";

router.get("/protected", authenticateToken, handler);
```

Sets on `req.user` and `req.auth`:

- `userId` - User ID
- `email` - User email
- `role` - User role name
- `permissions` - Array of permission strings

### `authorizeRoles(...allowedRoles)`

Checks if user has one of the required roles.

```javascript
import { authorizeRoles } from "../../middleware/rbac.middleware.js";

router.delete(
  "/admin/users/:id",
  authenticateToken,
  authorizeRoles("Admin", "Super Admin"),
  handler,
);
```

### `authorizePermissions(...requiredPermissions)`

Checks if user has at least one of the required permissions.

```javascript
import { authorizePermissions } from "../../middleware/rbac.middleware.js";

router.get(
  "/users",
  authenticateToken,
  authorizePermissions("users:view"),
  handler,
);
```

Supports multiple permissions (user needs ANY one):

```javascript
authorizePermissions("invoices:view", "invoices:create");
```

### `requireSuperAdmin`

Convenience middleware for super-admin-only operations.

```javascript
import { requireSuperAdmin } from "../../middleware/rbac.middleware.js";

router.post("/system/reset", authenticateToken, requireSuperAdmin, handler);
```

## JWT Payload

Tokens now include role and permissions:

```json
{
  "sub": "user-uuid",
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "Admin",
  "permissions": ["applications:view", "users:view", "invoices:view", ...],
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Login Response

The `/api/auth/login` endpoint now returns permissions in the JWT. The new `/api/auth/me` endpoint returns:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      ...
    },
    "role": "Admin",
    "permissions": ["applications:view", "users:view", ...]
  }
}
```

## Usage Examples

### Route with Role Check

```javascript
import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middleware/rbac.middleware.js";

const router = Router();

router.post(
  "/admin/users",
  authenticateToken,
  authorizeRoles("Admin", "Super Admin"),
  createUser,
);

export default router;
```

### Route with Permission Check

```javascript
router.get(
  "/applications",
  authenticateToken,
  authorizePermissions("applications:view"),
  listApplications,
);
```

### Route with Multiple Permissions

```javascript
router.post(
  "/invoices/:id/approve",
  authenticateToken,
  authorizePermissions("invoices:approve", "invoices:edit"),
  approveInvoice,
);
```

### Route with Super Admin Only

```javascript
router.delete("/system/data", authenticateToken, requireSuperAdmin, purgeData);
```

## Backward Compatibility

Old middleware files still work - they delegate to the new RBAC system:

| Old File                   | Maps To                                | Status   |
| -------------------------- | -------------------------------------- | -------- |
| `auth.js`                  | `rbac.middleware.authenticateToken`    | ✅ Works |
| `authMiddleware.js`        | `rbac.middleware.authenticateToken`    | ✅ Works |
| `authenticateUser.js`      | `rbac.middleware.authenticateToken`    | ✅ Works |
| `authorizeRoles.js`        | `rbac.middleware.authorizeRoles`       | ✅ Works |
| `permissionMiddleware.js`  | `rbac.middleware.authorizePermissions` | ✅ Works |
| `permission.middleware.js` | `rbac.middleware.authorizePermissions` | ✅ Works |
| `rbac.js`                  | `rbac.middleware.authorizeRoles`       | ✅ Works |

Existing routes using old imports will continue working without changes.

## Migration to New System

### Step 1: Update Imports (Optional)

```javascript
// Old
import authenticate from "../../middleware/auth.js";
import authorizeRoles from "../../middleware/authorizeRoles.js";

// New (recommended)
import {
  authenticateToken,
  authorizeRoles,
} from "../../middleware/rbac.middleware.js";
```

### Step 2: Update Middleware Names (Optional)

```javascript
// Old
router.get("/admin", authenticate, authorizeRoles("Admin"), handler);

// New (recommended)
router.get("/admin", authenticateToken, authorizeRoles("Admin"), handler);
```

Old code continues working, but new code should use the recommended imports.

## Frontend Integration

The `/api/auth/me` endpoint provides everything needed for dynamic sidebar:

```javascript
// Frontend
const response = await fetch("/api/auth/me", {
  headers: { Authorization: `Bearer ${token}` },
});

const { user, role, permissions } = response.data;

// Build dynamic sidebar based on permissions
const sidebarItems = [];
if (permissions.includes("users:view")) {
  sidebarItems.push({ label: "Users", path: "/users" });
}
if (permissions.includes("invoices:view")) {
  sidebarItems.push({ label: "Invoices", path: "/invoices" });
}
```

## FlutterFlow Integration

FlutterFlow apps can:

1. Call `/api/auth/login` to get JWT
2. Store JWT in local storage
3. Add Authorization header to all API requests
4. Call `/api/auth/me` to get permissions
5. Show/hide UI elements based on permissions array

## Repository Functions

### Role Repository (`modules/admin/role.repository.js`)

```javascript
// Get user's role name
const roleName = await getUserRole(userId);

// Get user's role with full details
const roleDetails = await getUserRoleWithDetails(userId);

// Assign role to user
await assignRoleToUser(userId, roleId);

// Remove role from user
await removeRoleFromUser(userId, roleId);

// Get all roles
const roles = await getAllRoles();

// Get role by ID
const role = await getRoleById(roleId);

// Get role by name
const role = await getRoleByName("Admin");
```

### Permission Repository (`modules/admin/permission.repository.js`)

```javascript
// Get all permissions for a role
const permissions = await getRolePermissions(roleId);

// Get permission names only
const permNames = await getRolePermissionNames(roleId);

// Get all permissions in system
const allPerms = await getAllPermissions();

// Get permissions grouped by module
const grouped = await getPermissionsByModule();
// Returns: { applications: [...], users: [...], ... }

// Get permission by name
const perm = await getPermissionByName("applications:view");

// Assign permission to role
await assignPermissionToRole(roleId, permissionId);

// Remove permission from role
await removePermissionFromRole(roleId, permissionId);

// Bulk assign permissions
await bulkAssignPermissionsToRole(roleId, [permId1, permId2, ...]);

// Clear all permissions from role
await clearRolePermissions(roleId);
```

## Troubleshooting

### Token expired errors

Tokens expire per `JWT_EXPIRES_IN` env var (default: 24h). Frontend should refresh token or re-login.

### Permission denied on login

Ensure `user_roles` entry exists for the user and corresponding `role_permissions` entries exist.

### Permissions not appearing in JWT

1. Check `user_roles` has the user + role
2. Check `roles` table has the role
3. Check `role_permissions` has entries for that role
4. Permissions are only fetched on login; verify new permissions are added before login

### Backward compat broken

If old middleware imports fail, check that legacy files still exist and delegate to rbac.middleware.js

## Performance Considerations

- Permissions are fetched once at login and embedded in JWT
- No database queries needed for permission checks during request
- Super Admin/Admin roles bypass detailed permission checks
- Middleware supports permission arrays of 100+ items efficiently

## Security Notes

- Never expose raw permission IDs to frontend - use names only
- Super Admin role has special bypass in middleware
- Permission checks in JWT prevent tampering (signatures verified by jwt.verify)
- All Supabase queries use appropriate RLS policies
- Passwords never appear in JWT payload
