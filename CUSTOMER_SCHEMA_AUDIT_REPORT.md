# Customer Schema Audit Report
**Generated:** 2026-06-09  
**Status:** CRITICAL - Schema Mismatch Preventing Application Creation  
**Issue:** PGRST204 Error - `full_name` column missing from `customers` table

---

## Executive Summary

The `customers` table in your Supabase database is **severely under-schemed** compared to what the ERP codebase expects. The table contains only **6 columns** but the codebase expects **9-14 columns** depending on which migration was intended to be the source of truth.

| Category | Count |
|----------|-------|
| **Current DB Columns** | 6 |
| **Expected Columns (Combined)** | 14 |
| **Missing Critical Columns** | 8 |
| **Missing Optional Columns** | 0 |
| **Unused/Deprecated Columns** | 0 |

**Impact:** Application creation fails immediately at the Supabase insert stage when trying to insert `full_name`.

---

## Section A: Detailed Column Comparison

### Current Database Schema
```
id                 (uuid)         - Primary Key ✓
email              (text)         - Contact ✓
phone              (text)         - Contact ✓
passport_number    (text)         - Visa ✓
created_at         (timestamptz)  - Audit ✓
updated_at         (timestamptz)  - Audit ✓
```

### Expected Schema (Canonical - Combined Best Practice)

| Column | Type | Constraint | Source | Priority | Status | Reason |
|--------|------|-----------|--------|----------|--------|--------|
| **id** | uuid | PK, default gen_random_uuid() | Migration 20260310 | P1 | ✓ Exists | Primary identifier |
| **full_name** | text | NOT NULL | Migration 20260310 & 20260311 | P1 | ❌ **MISSING** | **CRITICAL: Causes PGRST204 error** |
| **email** | text | (optional) | Migration 20260310 & 20260311 | P2 | ✓ Exists | Contact method |
| **phone** | text | (optional) | Migration 20260310 & 20260311 | P2 | ✓ Exists | Contact method |
| **passport_number** | text | Unique where not null | Migration 20260311 | P1 | ✓ Exists | Visa applicant identifier |
| **nationality** | text | (optional) | Migration 20260311 | P2 | ❌ **MISSING** | Visa eligibility, reporting |
| **date_of_birth** | date | (optional) | Migration 20260311 | P2 | ❌ **MISSING** | Visa requirement, age verification |
| **notes** | text | (optional) | Migration 20260311 | P3 | ❌ **MISSING** | CRM timeline, internal notes |
| **user_id** | uuid | FK to users, unique where not null | Migration 20260310 | P3 | ❌ **MISSING** | Account linking, multi-user support |
| **country_id** | uuid | FK to countries | Migration 20260310 | P3 | ❌ **MISSING** | Visa destination preference |
| **status** | text | default 'active' | Migration 20260310 | P3 | ❌ **MISSING** | Customer lifecycle, reporting |
| **first_name** | text | (deprecated) | Migration 20260310 | P4-DEPRECATED | ❌ Not Added | Name parsing handled at UI layer; redundant with full_name |
| **middle_name** | text | (deprecated) | Migration 20260310 | P4-DEPRECATED | ❌ Not Added | Name parsing handled at UI layer; redundant with full_name |
| **last_name** | text | (deprecated) | Migration 20260310 | P4-DEPRECATED | ❌ Not Added | Name parsing handled at UI layer; redundant with full_name |

---

## Section B: Migration Conflict Analysis

### Migration 20260310: `auth_and_erp_repair.sql`
**Created:** Early in project lifecycle  
**Purpose:** Initial customer table with user account linking  

**Schema Defined:**
```sql
id, user_id, full_name, first_name, middle_name, last_name, 
email, phone, country_id, status, created_at, updated_at
```

**Assessment:** Comprehensive but includes redundant name decomposition

### Migration 20260311: `visa_matrix_erp_core.sql`
**Created:** Later, after first migration  
**Purpose:** Redefine customer table for visa operations  

**Schema Defined:**
```sql
id, full_name, email, phone, passport_number, 
nationality, date_of_birth, notes, created_at, updated_at
```

**Assessment:** Focused on visa applicant data; DROPS user_id, country_id, status

**Key Issue:** This migration uses `CREATE TABLE IF NOT EXISTS` followed by `ALTER TABLE ADD COLUMN IF NOT EXISTS`, which is backwards-compatible but OVERWRITES 20260310 if 20260310 is applied first.

### Conflict Resolution
Migration 20260311 **should supersede** 20260310 because:
1. It defines the canonical visa applicant schema
2. It is applied after 20260310 in sequence
3. The application flow is visa-centric, not user-account-centric
4. However, it should **restore** user_id and status for account linking and CRM integration

---

## Section C: Code Analysis - Column Usage

### Backend Services Layer

#### referenceService.js (Line 7)
```javascript
const customerSelect = "id, full_name, email, phone, passport_number, nationality, created_at";
```
**Expects:** 7 specific columns for search/display  
**Status:** Missing full_name, nationality ❌

#### validateCustomerPayload (moduleValidators.js, Line 111-128)
```javascript
validateCustomerPayload = {
  full_name: REQUIRED,
  email: optional,
  phone: optional,
  passport_number: optional,
  nationality: optional,
  date_of_birth: optional,
  notes: optional
}
```
**Expects:** 7 fields total, 1 required (full_name)  
**Status:** Full validation schema ready; just need DB columns ✓

#### customerService.js (Line 10-30)
```javascript
Uses generic createRecord/listRecords/updateRecord with select: "*"
```
**Expects:** All columns from database  
**Status:** Will work once columns exist ✓

#### customerRepository.js (Line 10-12)
```javascript
searchColumns: ["full_name", "email", "phone", "passport_number"]
```
**Expects:** 4 searchable columns  
**Status:** Missing full_name ❌

### Backend Routes Layer

#### customer.routes.js (Line 23-32)
```javascript
const customerBodySchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(30).optional(),
  passport_number: z.string().min(3).max(50).optional(),
  nationality: z.string().min(2).max(100).optional(),
}).passthrough()
```
**Accepts:** 5 fields including full_name  
**Status:** Ready; .passthrough() allows other fields ✓

### Frontend Layer

#### ApplicationCreateDialog.tsx (Line 191-195)
```javascript
const customerPayload = {
  full_name: fullName,
  email,
  phone,
  passport_number: passportNumber,
};
```
**Sends:** 4 fields to POST /customers  
**Status:** Payload structure correct ✓  
**Issue:** Fails at Supabase insert because full_name column doesn't exist

---

## Section D: Impact Analysis

### Current Blocked Flows
1. **Visa Application Creation** ❌ BLOCKED
   - ApplicationCreateDialog.tsx calls POST /customers with full_name
   - baseRepository.js executes: `supabase.from("customers").insert(payload)`
   - **Error:** PGRST204 - Column not found

2. **Customer Creation** ❌ BLOCKED
   - Any direct customer creation fails
   - Affects CRM module, admin functions

3. **Customer Search** ❌ BLOCKED
   - referenceService.js searches using full_name
   - Returns error when full_name column missing

### Operational Impact
- **Visa applications cannot be created**
- **CRM customer workflow blocked**
- **Dashboard metrics empty** (no customers to report)
- **User experience:** Form appears to submit but fails silently or with cryptic error

---

## Section E: Files Affected by Schema Change

### Database
1. `backend/supabase/migrations/20260311_visa_matrix_erp_core.sql`
   - Current: Only creates/alters customers table, missing full_name NOT NULL constraint
   - Action: **SAFE - Apply missing columns, do not modify**

### Backend Code (NO CHANGES REQUIRED)
✓ All backend code is already prepared:
- `src/modules/customers/customer.routes.js` - Ready
- `src/modules/customers/customer.controller.js` - Ready
- `src/modules/customers/customer.service.js` - Ready
- `src/modules/customers/customer.repository.js` - Ready (searches full_name)
- `src/validators/moduleValidators.js` - Ready
- `src/services/referenceService.js` - Ready (expects full_name, nationality)

### Frontend Code (NO CHANGES REQUIRED)
✓ Frontend payload structure correct:
- `visa-matrix-frontend/visa-matrix-frontend/src/loveable/components/applications/ApplicationCreateDialog.tsx` - Ready

### No Breaking Changes
- Existing customer records will not be deleted
- Adding columns is non-destructive
- All code is backward compatible

---

## Section F: Recommended Schema Resolution

### Decision: Adopt Combined Best-Practice Schema
**Rationale:**
- Visa operations are primary (20260311 is newer, visa-centric)
- But account linking and workflow status are valuable for CRM/ERP
- Deprecate name decomposition (first_name, middle_name, last_name)
- Keep full_name as canonical identifier

### Final Canonical Schema
```sql
CREATE TABLE customers (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact/Identification (P1)
  full_name         TEXT          NOT NULL,
  email             TEXT          UNIQUE (where not null),
  phone             TEXT,
  
  -- Visa/Immigration (P1-P2)
  passport_number   TEXT          UNIQUE (where not null),
  nationality       TEXT,
  date_of_birth     DATE,
  
  -- CRM/Account (P3)
  user_id           UUID          UNIQUE (where not null),
  status            TEXT          DEFAULT 'active',
  country_id        UUID,
  
  -- Notes (P3)
  notes             TEXT,
  
  -- Audit
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT timezone('utc', now()),
  
  -- Foreign Keys
  CONSTRAINT customers_user_fk 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT customers_country_fk 
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  
  -- Check Constraints
  CONSTRAINT customers_status_check 
    CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  
  -- Indexes
  CONSTRAINT customers_email_unique 
    UNIQUE (LOWER(email)) WHERE email IS NOT NULL,
  CONSTRAINT customers_passport_unique 
    UNIQUE (passport_number) WHERE passport_number IS NOT NULL
)
```

---

## Section G: Columns NOT Included (Justification)

### Deprecated: first_name, middle_name, last_name
**Reason:** 
- `full_name` is the canonical identifier
- Name parsing/decomposition is UI concern, not database concern
- Introduces data consistency issues (what if first_name is out of sync with full_name?)
- No code currently populates or uses these fields independently
- **Migration Strategy:** If any customers have first_name data, concatenate to full_name during data backfill

---

## Section H: Data Preservation Strategy

### Before Migration
1. Existing 6 columns remain unchanged: id, email, phone, passport_number, created_at, updated_at
2. All existing customer records preserved

### After Migration
1. New columns added with NULL defaults (except full_name which has default if backfill provided)
2. Column indexes and constraints added
3. All existing records remain unchanged
4. New records can now include full_name, nationality, date_of_birth, etc.

### Data Backfill
If existing customers need full_name populated:
```sql
-- Backfill full_name from email or other source if available
UPDATE customers 
SET full_name = COALESCE(notes, 'Customer ' || id::text)
WHERE full_name IS NULL;
```

---

## Section I: Indexes and Performance

### Proposed Indexes
```sql
-- Unique Constraints
UNIQUE INDEX customers_email_unique ON customers (LOWER(email)) WHERE email IS NOT NULL;
UNIQUE INDEX customers_passport_unique ON customers (passport_number) WHERE passport_number IS NOT NULL;
UNIQUE INDEX customers_user_id_key ON customers (user_id) WHERE user_id IS NOT NULL;

-- Search Optimization
INDEX customers_full_name_idx ON customers (full_name);
INDEX customers_created_at_idx ON customers (created_at);

-- Foreign Key Optimization
INDEX customers_country_id_idx ON customers (country_id);
INDEX customers_user_id_idx ON customers (user_id);
```

---

## Section J: Migration Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Data loss | LOW | Using ADD COLUMN, not DROP; existing data preserved |
| Downtime | LOW | Schema changes are non-blocking |
| Breaking changes | LOW | Only adding columns; all existing code works |
| Type mismatch | LOW | Using exact types from validation layer |
| Constraint violation | MEDIUM | Check for NULL passport_number/email before adding UNIQUE |
| Foreign key constraint | LOW | user_id/country_id reference existing tables; non-required |

---

## Section K: Verification Checklist

After migration, verify:

### Database Layer
- [ ] customers table has all 14 columns
- [ ] full_name column is NOT NULL
- [ ] unique indexes created for email, passport_number, user_id
- [ ] foreign key constraints exist for user_id, country_id
- [ ] updated_at trigger firing on UPDATE
- [ ] RLS disabled on customers table (per 20260311)

### API Level
- [ ] POST /customers with full_name succeeds
- [ ] POST /customers without full_name fails with validation error
- [ ] GET /customers returns all new columns
- [ ] Search by full_name works
- [ ] Search by passport_number works

### Frontend Level
- [ ] ApplicationCreateDialog form submission succeeds
- [ ] Customer created with correct data
- [ ] Application links to customer correctly

### Business Logic
- [ ] Visa application creation succeeds end-to-end
- [ ] Customer search returns results
- [ ] Dashboard customer metrics display

---

## Section L: Rollback Plan

If issues arise, rollback migration:
```sql
-- Drop newly added columns (preserves data in remaining columns)
ALTER TABLE customers DROP COLUMN IF EXISTS full_name;
ALTER TABLE customers DROP COLUMN IF EXISTS nationality;
ALTER TABLE customers DROP COLUMN IF EXISTS date_of_birth;
ALTER TABLE customers DROP COLUMN IF EXISTS notes;
ALTER TABLE customers DROP COLUMN IF EXISTS user_id;
ALTER TABLE customers DROP COLUMN IF EXISTS status;
ALTER TABLE customers DROP COLUMN IF EXISTS country_id;

-- Revert to original 6 columns:
-- id, email, phone, passport_number, created_at, updated_at
```

---

## Conclusion

**Recommendation:** PROCEED with schema reconciliation migration

The current customers table schema is incomplete compared to ERP requirements. The fix is straightforward:
1. Add missing columns to match code expectations
2. Preserve all existing data
3. No code changes required (backend and frontend are already aligned)
4. Low risk: additive-only schema changes
5. High impact: Unblocks critical Visa Application flow

**Next Step:** Apply the reconciliation migration provided in `CUSTOMER_SCHEMA_MIGRATION.sql`
