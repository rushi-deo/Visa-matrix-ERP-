# Testing Admin User Login and RBAC

This guide explains how to test the admin user login and RBAC functionality.

## Quick Start

### 1. Seed the admin user

```bash
npm run seed:admin
```

Expected output:

```
✅ Admin user seed completed successfully!

📋 Admin Credentials:
   Email: admin@visamatrix.com
   Password: admin123
   Role: admin
```

### 2. Start the backend server

```bash
npm run dev
```

Server should start without errors:

```
✓ Backend server running on http://localhost:3000
```

## Testing Endpoints

### 1. Login Test

**Request:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@visamatrix.com",
    "password": "admin123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "some-uuid",
      "email": "admin@visamatrix.com",
      "full_name": "Admin User",
      "role": "admin",
      "is_active": true
    },
    "session": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresAt": 1234567890
    }
  },
  "message": "User logged in successfully."
}
```

**Status Code:** `200 OK`

### 2. Get Current User (Authenticated)

**Request:**

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer {TOKEN}"
```

Replace `{TOKEN}` with the token from the login response.

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "some-uuid",
      "email": "admin@visamatrix.com",
      "full_name": "Admin User",
      "role": "admin",
      "is_active": true
    },
    "role": "admin",
    "permissions": ["*"]
  },
  "message": "Current user retrieved successfully."
}
```

**Status Code:** `200 OK`

### 3. Secure Route Test (Requires Authentication)

**Request:**

```bash
curl -X GET http://localhost:3000/test/secure-test \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Secure test route accessible.",
  "user": {
    "id": "some-uuid",
    "email": "admin@visamatrix.com"
  }
}
```

**Status Code:** `200 OK`

### 4. Admin Route Test (Requires Admin Role)

**Request:**

```bash
curl -X GET http://localhost:3000/test/admin-test \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Admin test route accessible.",
  "user": {
    "id": "some-uuid",
    "email": "admin@visamatrix.com"
  },
  "roles": ["admin"]
}
```

**Status Code:** `200 OK`

## Error Cases to Test

### 1. Invalid Credentials

**Request:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@visamatrix.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**Status Code:** `401 Unauthorized`

### 2. Missing Authorization Header

**Request:**

```bash
curl -X GET http://localhost:3000/auth/me
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

**Status Code:** `401 Unauthorized`

### 3. Invalid Token

**Request:**

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Status Code:** `401 Unauthorized`

### 4. Expired Token

If you wait until the JWT expires (or use an expired token):

**Expected Response:**

```json
{
  "success": false,
  "message": "Token has expired"
}
```

**Status Code:** `401 Unauthorized`

## RBAC Testing

### Test Admin Permissions

The admin user should have access to:

1. **All customer routes:**

   ```bash
   curl -X GET http://localhost:3000/customers \
     -H "Authorization: Bearer {TOKEN}"
   ```

2. **All country routes:**

   ```bash
   curl -X POST http://localhost:3000/countries \
     -H "Authorization: Bearer {TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{ "country_name": "Test", "country_code": "TE" }'
   ```

3. **All workflow routes:**
   ```bash
   curl -X GET http://localhost:3000/workflows \
     -H "Authorization: Bearer {TOKEN}"
   ```

### Test Non-Admin Routes (Should Fail)

Create a regular user and test that they cannot access admin-only routes:

```bash
# Create regular user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "Regular User"
  }'

# Login as regular user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Try to access admin-only country delete (should fail)
curl -X DELETE http://localhost:3000/countries/{id} \
  -H "Authorization: Bearer {REGULAR_USER_TOKEN}"
```

**Expected Response:**

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Status Code:** `403 Forbidden`

## Common Issues

### Issue: "User profile not found"

**Solution:** Ensure the profiles table exists and the admin profile is created.

```bash
npm run seed:admin
```

### Issue: "Invalid email or password" on correct credentials

**Solution:**

- Verify admin exists in Supabase Auth: Check Supabase dashboard
- Verify admin profile exists: Check profiles table in database
- Check that the password is exactly: `admin123`

### Issue: Token not working

**Solution:**

- Verify token is not expired
- Verify token format is: `Bearer {TOKEN}`
- Check that Authorization header is exactly `Authorization`

### Issue: Admin routes still return 403

**Solution:**

- Verify admin role is "admin" in profiles table
- Check that RBAC middleware is applied correctly
- Verify role permissions are loaded from roles/permissions tables

## Postman Collection

Import this collection into Postman for easier testing:

```json
{
  "info": {
    "name": "Visa Matrix Admin Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Admin Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@visamatrix.com\",\n  \"password\": \"admin123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "me"]
        }
      }
    },
    {
      "name": "Admin Test Route",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/test/admin-test",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["test", "admin-test"]
        }
      }
    }
  ]
}
```

Save this as `Visa-Matrix-Testing.postman_collection.json` and import into Postman.

## Next Steps

After successful testing:

1. ✅ Create additional test users with different roles
2. ✅ Test authorization for different routes
3. ✅ Test permission inheritance from roles
4. ✅ Test Super Admin vs Admin differences
5. ✅ Verify audit logs are created for all actions
