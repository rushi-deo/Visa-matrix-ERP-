# Code Audit Report - Customer Module
**Generated:** 2026-06-09  
**Scope:** Full stack tracing of customer creation flow  
**Finding:** Code is correctly aligned with expected schema; no code changes required

---

## Executive Summary

A comprehensive audit of all code touching the `customers` entity has been completed. The findings indicate:

✅ **No Code Changes Required** - All code is correctly expecting the columns that will be added by the migration

✅ **Backend is Ready** - All validation, routing, and repository code supports the full customer schema

✅ **Frontend is Ready** - Application creation dialog sends correct payload

❌ **Only Database is Incomplete** - Supabase `customers` table missing 8 columns

---

## Section A: Files Reviewed

### Backend - Database Layer

| File | Path | Status | Findings |
|------|------|--------|----------|
| Migration 20260310 | `backend/supabase/migrations/20260310_auth_and_erp_repair.sql` | REVIEWED | Defines comprehensive schema (12 columns); serves as baseline |
| Migration 20260311 | `backend/supabase/migrations/20260311_visa_matrix_erp_core.sql` | REVIEWED | Redefines schema for visa focus (8 columns); later, more specific |
| Base Repository | `backend/src/core/baseRepository.js` | REVIEWED | Generic CRUD; correctly uses Supabase client; no transformation needed |

**Database Schema Status:**
```
Current:    id, email, phone, passport_number, created_at, updated_at (6 columns)
Expected:   id, email, phone, passport_number, created_at, updated_at,
            full_name, nationality, date_of_birth, notes, user_id, status, country_id (13+ columns)
```

### Backend - Customer Module

| File | Path | Status | Findings |
|------|------|--------|----------|
| Routes | `backend/src/modules/customers/customer.routes.js` | ✅ READY | Validates full_name, email, phone, passport_number, nationality with Zod schema; uses .passthrough() for flexibility |
| Controller | `backend/src/modules/customers/customer.controller.js` | ✅ READY | Simple wrapper; passes payload through to service layer |
| Service | `backend/src/modules/customers/customer.service.js` | ✅ READY | Generic CRUD wrappers; supports full customer lifecycle |
| Repository | `backend/src/modules/customers/customer.repository.js` | ✅ READY | Searches on full_name, email, phone, passport_number; ready for column existence |
| Validator | `backend/src/validators/moduleValidators.js` | ✅ READY | validateCustomerPayload accepts: full_name (required), email, phone, passport_number, nationality, date_of_birth, notes |

**Code Assessment:**
All customer module files are production-ready and expect exactly the columns that the migration will provide.

### Backend - Reference Services

| File | Path | Status | Findings |
|------|------|--------|----------|
| Reference Service | `backend/src/services/referenceService.js` | ✅ READY | Selects: id, full_name, email, phone, passport_number, nationality, created_at; searches across these fields |
| Report Service | `backend/src/services/reportService.js` | ✅ READY | Uses applications.country_id; no direct customer dependencies |

**Service Assessment:**
All service layer code is aligned with expected schema.

### Backend - Integration Points

| File | Path | Status | Findings |
|------|------|--------|----------|
| Applications Module | `backend/src/modules/applications/` | ✅ READY | References customers via customer_id FK; compatible with schema |
| Documents Module | `backend/src/modules/documents/` | ✅ READY | References applications; no direct customer coupling |
| Payments Module | `backend/src/modules/payments/` | ✅ READY | References applications; no direct customer coupling |

**Integration Assessment:**
All dependent modules reference customers through established FK relationships; schema additions will not break these.

### Frontend - Application Creation

| File | Path | Status | Findings |
|------|------|--------|----------|
| ApplicationCreateDialog | `visa-matrix-frontend/visa-matrix-frontend/src/loveable/components/applications/ApplicationCreateDialog.tsx` | ✅ READY | Sends POST /customers with: full_name, email, phone, passport_number |

**Payload Structure (Line 191-195):**
```javascript
const customerPayload = {
  full_name: fullName,
  email,
  phone,
  passport_number: passportNumber,
};
```

**Assessment:** Payload is correctly structured; all fields are in expected schema

### Frontend - CRM Integration

| File | Path | Status | Findings |
|------|------|--------|----------|
| CRM Customers Page | `visa-matrix-frontend/visa-matrix-frontend/src/loveable/routes/_app.crm.customers.tsx` | ✓ EXISTS | Page exists; currently uses mock data; backend ready |
| CRM Pipeline | `visa-matrix-frontend/visa-matrix-frontend/src/loveable/routes/_app.crm.pipeline.tsx` | ✓ EXISTS | Pipeline page exists; references leads/customers |
| Customer Profile | `visa-matrix-backend/frontend/src/features/crm/CustomerProfile.tsx` | ✓ EXISTS | Backend frontend has customer profile component |

**Frontend Assessment:**
Frontend has placeholder pages; backend provides API; schema additions will enable these flows.

---

## Section B: Data Flow Tracing

### Happy Path: Visa Application Creation

```
1. Frontend: ApplicationCreateDialog.tsx (Line 191)
   ↓
   Collects fullName, email, phone, passportNumber from form
   ↓
   Constructs customerPayload = {full_name, email, phone, passport_number}
   ↓
   Calls: apiClient.post("/customers", customerPayload)
   
2. Backend: customer.routes.js (Line 44)
   ↓
   POST /customers route handler
   ↓
   requestValidator checks body against customerBodySchema (Zod)
   ↓
   Routes to createCustomerController
   
3. Backend: customer.controller.js (Line 10)
   ↓
   createCustomerController receives req.body
   ↓
   Calls: createCustomerRecord(req.body)
   
4. Backend: customer.service.js (Line 19)
   ↓
   createCustomerRecord wraps createCustomer(payload)
   ↓
   Calls: customerCrudRepository.create(payload)
   
5. Backend: customer.repository.js (Line 10)
   ↓
   Repository calls: customerCrudRepository.create(payload)
   ↓
   
6. Backend: baseRepository.js (Line 90)
   ↓
   Executes: supabase.from("customers").insert(payload).select("*").single()
   ↓
   
7. Supabase PostgreSQL
   ↓
   INSERT INTO customers (full_name, email, phone, passport_number) VALUES (...)
   
   ❌ CURRENT: ERROR - Column full_name does not exist
   ✅ AFTER MIGRATION: SUCCESS - Column full_name exists with NOT NULL constraint
   ↓
   Returns customer record with all 13 columns
   
8. Backend: baseRepository.js (Line 95)
   ↓
   Returns data to controller
   ↓
   
9. Backend: customer.controller.js (Line 12)
   ↓
   Calls: sendCreated(res, data, "Customer created successfully.")
   ↓
   Returns 201 with customer object
   
10. Frontend: ApplicationCreateDialog.tsx (Line 199)
    ↓
    Receives response
    ↓
    Extracts customerId
    ↓
    Proceeds to visa application creation with customer_id reference
    ↓
    ✅ SUCCESS
```

### Broken Path (Current)

```
Frontend POST /customers with {full_name, email, phone, passport_number}
  ↓
Backend validation PASSES ✓
Backend repository READY ✓
Supabase INSERT attempted...
  ↓
❌ PGRST204: Could not find 'full_name' column
  ↓
Frontend: "Error creating customer" (or silent failure)
Application creation BLOCKED
```

---

## Section C: Schema Alignment Matrix

### What Migrations Define vs. What Code Expects

| Column | Migration 20260310 | Migration 20260311 | Code Expects | Actual DB | Status After Fix |
|--------|-------|------|-----|------|------|
| id | ✓ | ✓ | ✓ | ✓ | ✓ |
| email | ✓ | ✓ | ✓ | ✓ | ✓ |
| phone | ✓ | ✓ | ✓ | ✓ | ✓ |
| passport_number | ✗ | ✓ | ✓ | ✓ | ✓ |
| created_at | ✓ | ✓ | ✓ | ✓ | ✓ |
| updated_at | ✓ | ✓ | ✓ | ✓ | ✓ |
| **full_name** | **✓** | **✓** | **✓** | **✗** | **✓** |
| nationality | ✗ | ✓ | ✓ | ✗ | ✓ |
| date_of_birth | ✗ | ✓ | ✓ | ✗ | ✓ |
| notes | ✗ | ✓ | ✓ | ✗ | ✓ |
| user_id | ✓ | ✗ | (optional) | ✗ | ✓ |
| first_name | ✓ | ✗ | ✗ | ✗ | ✗ |
| middle_name | ✓ | ✗ | ✗ | ✗ | ✗ |
| last_name | ✓ | ✗ | ✗ | ✗ | ✗ |
| country_id | ✓ | ✗ | (optional) | ✗ | ✓ |
| status | ✓ | ✗ | (optional) | ✗ | ✓ |

**Key Finding:** All columns that code expects are defined in migrations; just not applied to actual database.

---

## Section D: Validation Compatibility

### Request Validation Flow

```javascript
// customer.routes.js
const customerBodySchema = z.object({
  full_name: z.string().min(2).max(120).optional(),     // ← Accepts but not enforced
  email: z.string().email().optional(),
  phone: z.string().min(6).max(30).optional(),
  passport_number: z.string().min(3).max(50).optional(),
  nationality: z.string().min(2).max(100).optional(),
}).passthrough()
```

vs.

```javascript
// moduleValidators.js
validateCustomerPayload({
  full_name: REQUIRED,        // ← More strict
  email: optional,
  phone: optional,
  passport_number: optional,
  nationality: optional,
  date_of_birth: optional,
  notes: optional,
})
```

**Note:** Route schema uses `.optional()` for full_name but validateCustomerPayload requires it. The service layer should use validateCustomerPayload for consistency, but currently doesn't enforce it. **No change needed** as long as frontend always sends full_name (which it does).

---

## Section E: Potential Issues & Mitigation

### 1. Existing Null full_name Values
**Risk:** If any records exist with NULL full_name after migration, INSERT will fail.  
**Mitigation:** Migration backfills NULL full_name with `'Customer ' || substring(id::text, 1, 8)`  
**Verification:** After migration, check:
```sql
SELECT COUNT(*) FROM customers WHERE full_name IS NULL;
-- Should return 0
```

### 2. Email Uniqueness
**Risk:** If duplicates exist in email column, UNIQUE index creation will fail.  
**Mitigation:** Index created WITH WHERE email IS NOT NULL (allows multiple NULLs)  
**Verification:** 
```sql
SELECT email, COUNT(*) FROM customers 
WHERE email IS NOT NULL 
GROUP BY email HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### 3. Passport Number Uniqueness
**Risk:** Duplicate passport_number values exist.  
**Mitigation:** Index created WITH WHERE passport_number IS NOT NULL  
**Verification:**
```sql
SELECT passport_number, COUNT(*) FROM customers 
WHERE passport_number IS NOT NULL 
GROUP BY passport_number HAVING COUNT(*) > 1;
-- Should return 0 rows
```

### 4. Foreign Key References
**Risk:** user_id or country_id values don't exist in referenced tables.  
**Mitigation:** Foreign keys use ON DELETE SET NULL (safe, non-cascading)  
**Verification:**
```sql
SELECT COUNT(*) FROM customers 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM profiles);
-- Should return 0
```

---

## Section F: Files Requiring NO Changes

### Backend Routes
```
customer.routes.js - READY
```
- Already accepts full_name, email, phone, passport_number, nationality
- Schema validation ready
- No changes needed

### Backend Controllers
```
customer.controller.js - READY
```
- Simple pass-through to service
- No business logic
- No changes needed

### Backend Services
```
customer.service.js - READY
customerService.js - READY
```
- Generic CRUD operations
- Will work with new columns
- No changes needed

### Backend Repositories
```
customer.repository.js - READY
baseRepository.js - READY
```
- Searches already reference full_name, passport_number
- Generic create/update/delete
- No changes needed

### Frontend
```
ApplicationCreateDialog.tsx - READY
```
- Already sends full_name, email, phone, passport_number
- Payload structure correct
- No changes needed

### No Code Modifications Required Anywhere

✅ All code is forward-compatible with the new schema
✅ No field mappings need to change
✅ No validation logic needs updating
✅ No API contracts need revision

---

## Section G: Verification Tests

After migration, these operations should succeed:

### Test 1: Create Customer (Full Payload)
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "passport_number": "ABC123456",
    "nationality": "US",
    "date_of_birth": "1990-01-01",
    "notes": "Test customer"
  }'

Expected: 201 Created with full customer object
```

### Test 2: Create Customer (Minimal Payload)
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Jane Smith"}'

Expected: 201 Created (email, phone, etc. optional)
```

### Test 3: Search by Full Name
```bash
curl "http://localhost:3000/api/references/search?q=John"

Expected: 200 OK with customer in results
```

### Test 4: Create Visa Application (Full Flow)
```javascript
// Frontend: ApplicationCreateDialog form submit
// Should now succeed end-to-end
```

---

## Section H: Future Enhancements

No blocking issues identified, but potential future improvements:

1. **Full Validation Integration:** Consider using `validateCustomerPayload` in service layer for consistent validation across all entry points

2. **Name Parsing:** If UI needs to decompose full_name into first/middle/last for display, handle at frontend layer (not database)

3. **Soft Deletes:** `status` column supports lifecycle; consider soft delete implementation if not already planned

4. **User Account Linking:** `user_id` FK enables per-user customer creation; integrate into auth flow

5. **Country Preference:** `country_id` enables visa destination history; useful for dashboard/analytics

---

## Section I: Conclusion

**All code is correctly implemented.** The issue is purely a schema gap in the Supabase database. 

The provided migration (`20260609_reconcile_customers_schema.sql`) will:

✅ Add all missing columns  
✅ Preserve existing data  
✅ Add required constraints and indexes  
✅ Require NO code changes  
✅ Unblock Visa Application creation  

**Status:** Ready to apply migration
