# Verification Checklist - Customer Schema Migration
**Date:** 2026-06-09  
**Migration:** `20260609_reconcile_customers_schema.sql`  
**Status:** Ready for verification

---

## Pre-Migration Verification

Before applying the migration, verify current state:

### Database Verification
- [ ] Connect to Supabase project
- [ ] Confirm current customers table has only 6 columns:
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'customers' 
  ORDER BY ordinal_position;
  ```
  Expected output:
  ```
  id                | uuid
  email             | text
  phone             | text
  passport_number   | text
  created_at        | timestamp with time zone
  updated_at        | timestamp with time zone
  ```

- [ ] Verify no existing customers have NULL email or phone (optional fields OK to be NULL):
  ```sql
  SELECT COUNT(*) FROM customers WHERE email IS NULL OR phone IS NULL;
  ```

- [ ] Verify no duplicate passport_number values:
  ```sql
  SELECT passport_number, COUNT(*) 
  FROM customers 
  WHERE passport_number IS NOT NULL 
  GROUP BY passport_number 
  HAVING COUNT(*) > 1;
  ```
  Expected: 0 rows

- [ ] Backup current customers table:
  ```sql
  CREATE TABLE customers_backup_20260609 AS SELECT * FROM customers;
  ```

### Backend Code Verification
- [ ] Confirm backend is at version that expects full_name, nationality, etc.
- [ ] Verify customer.routes.js validates full_name as optional (will be enforced after migration)
- [ ] Verify referenceService.js selects full_name, nationality

### Frontend Code Verification
- [ ] Confirm ApplicationCreateDialog.tsx sends full_name in POST /customers payload
- [ ] Verify no hardcoded column lists that would break

---

## Apply Migration

### Step 1: Execute Migration
```bash
# Via Supabase CLI
supabase db push

# OR manually in Supabase SQL Editor:
# Copy entire contents of: backend/supabase/migrations/20260609_reconcile_customers_schema.sql
# Paste into Supabase SQL Editor
# Click "RUN"
```

### Step 2: Verify Migration Success
- [ ] Migration completes without errors
- [ ] No rollback messages
- [ ] Check migration history:
  ```sql
  SELECT * FROM schema_migrations 
  WHERE version = '20260609' 
  OR name LIKE '%reconcile_customers%';
  ```

---

## Post-Migration Verification

### Schema Verification
- [ ] Confirm all new columns exist:
  ```sql
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'customers' 
  ORDER BY ordinal_position;
  ```
  
  Expected columns (13):
  ```
  id                | uuid                      | NO
  email             | text                      | YES
  phone             | text                      | YES
  passport_number   | text                      | YES
  created_at        | timestamp with time zone  | NO
  updated_at        | timestamp with time zone  | NO
  full_name         | text                      | NO        [NEW]
  nationality       | text                      | YES       [NEW]
  date_of_birth     | date                      | YES       [NEW]
  notes             | text                      | YES       [NEW]
  user_id           | uuid                      | YES       [NEW]
  status            | text                      | YES       [NEW, default: 'active']
  country_id        | uuid                      | YES       [NEW]
  ```

- [ ] Verify full_name has NOT NULL constraint:
  ```sql
  SELECT is_nullable FROM information_schema.columns 
  WHERE table_name = 'customers' AND column_name = 'full_name';
  ```
  Expected: `NO`

- [ ] Verify status column has default 'active':
  ```sql
  SELECT column_default 
  FROM information_schema.columns 
  WHERE table_name = 'customers' AND column_name = 'status';
  ```
  Expected: `'active'::text`

### Constraints Verification
- [ ] Check all constraints exist:
  ```sql
  SELECT constraint_name, constraint_type 
  FROM information_schema.table_constraints 
  WHERE table_name = 'customers';
  ```
  
  Expected constraints:
  ```
  customers_pkey                    | PRIMARY KEY
  customers_status_check            | CHECK
  customers_user_fk                 | FOREIGN KEY
  customers_country_fk              | FOREIGN KEY
  ```

- [ ] Verify unique constraint on email:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename = 'customers' AND indexname LIKE '%email%';
  ```
  Expected: `customers_email_unique`

- [ ] Verify unique constraint on passport_number:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename = 'customers' AND indexname LIKE '%passport%';
  ```
  Expected: `customers_passport_number_unique`

- [ ] Verify unique constraint on user_id:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename = 'customers' AND indexname LIKE '%user_id%';
  ```
  Expected: `customers_user_id_unique`

### Indexes Verification
- [ ] Check all indexes created:
  ```sql
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = 'customers' 
  ORDER BY indexname;
  ```
  
  Expected indexes:
  ```
  customers_country_id_idx
  customers_created_at_idx
  customers_email_unique
  customers_full_name_idx
  customers_passport_number_unique
  customers_pkey
  customers_user_id_idx
  customers_user_id_unique
  ```

### Trigger Verification
- [ ] Check updated_at trigger exists:
  ```sql
  SELECT trigger_name, event_manipulation, event_object_table 
  FROM information_schema.triggers 
  WHERE event_object_table = 'customers';
  ```
  Expected: `set_customers_updated_at` trigger on UPDATE events

- [ ] Test trigger by updating a record:
  ```sql
  UPDATE customers SET notes = 'test' WHERE id = (SELECT id FROM customers LIMIT 1);
  SELECT id, updated_at FROM customers WHERE notes = 'test';
  ```
  Expected: `updated_at` is current timestamp

### Data Integrity Verification
- [ ] Verify no records lost:
  ```sql
  SELECT COUNT(*) FROM customers;
  ```
  Expected: Same count as pre-migration

- [ ] Verify all records still have id, email, phone, passport_number:
  ```sql
  SELECT COUNT(*) FROM customers 
  WHERE id IS NULL OR email IS NULL OR phone IS NULL OR passport_number IS NULL;
  ```
  Expected: 0 (these columns should not be NULL for any record)

- [ ] Verify full_name was backfilled:
  ```sql
  SELECT COUNT(*) FROM customers WHERE full_name IS NULL;
  ```
  Expected: 0 (all records should have full_name, either original or backfilled)

- [ ] Verify foreign key references:
  ```sql
  SELECT COUNT(*) FROM customers 
  WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM profiles);
  ```
  Expected: 0 (no orphaned user_id references)

---

## API Testing

### Test 1: Create Customer with Full Payload
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Customer",
    "email": "test@example.com",
    "phone": "+1234567890",
    "passport_number": "TEST123456",
    "nationality": "United States",
    "date_of_birth": "1990-01-15",
    "notes": "Test record for migration verification"
  }'
```

- [ ] Response status: `201 Created`
- [ ] Response body includes all submitted fields
- [ ] Response includes: id, created_at, updated_at
- [ ] Check database:
  ```sql
  SELECT * FROM customers 
  WHERE email = 'test@example.com';
  ```

### Test 2: Create Customer with Minimal Payload
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Minimal Test"}'
```

- [ ] Response status: `201 Created`
- [ ] full_name saved correctly
- [ ] email, phone, passport_number, nationality, date_of_birth, notes are NULL
- [ ] status defaults to 'active'

### Test 3: Create Customer Without full_name (Should Fail)
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "nofullname@example.com"}'
```

- [ ] Response status: `400 Bad Request` or `422 Unprocessable Entity`
- [ ] Error message indicates full_name is required

### Test 4: Get Customer by ID
```bash
curl -X GET http://localhost:3000/api/customers/{customer_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Response status: `200 OK`
- [ ] Response includes all 13 columns (including new ones)
- [ ] All fields match what was created

### Test 5: List Customers
```bash
curl -X GET "http://localhost:3000/api/customers?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Response status: `200 OK`
- [ ] Response includes list of customers
- [ ] Each record has all columns

### Test 6: Search by Full Name
```bash
curl -X GET "http://localhost:3000/api/references/search?q=Test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Response status: `200 OK`
- [ ] Returns customers matching "Test" in full_name
- [ ] Response includes customer objects with id, full_name, email, phone, passport_number, nationality

### Test 7: Update Customer
```bash
curl -X PUT http://localhost:3000/api/customers/{customer_id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nationality": "Canada",
    "notes": "Updated notes"
  }'
```

- [ ] Response status: `200 OK`
- [ ] Nationality updated
- [ ] Notes updated
- [ ] updated_at timestamp changed

### Test 8: Create Visa Application (Full Flow)
```javascript
// Frontend: Navigate to Create Application
// Fill form with:
//   Full Name: "Application Test"
//   Email: "apptest@example.com"
//   Phone: "+9876543210"
//   Passport: "APP987654"
//   Country: "Canada"
// Click Submit
```

- [ ] Form submits successfully
- [ ] POST /customers called with payload
- [ ] Customer created in database
- [ ] Application created linked to customer
- [ ] Response shows success
- [ ] Application detail page loads with correct customer info

---

## Regression Testing

### Existing Features
- [ ] **Customer List:** Navigate to CRM → Customers, verify loads
- [ ] **Customer Search:** Search for existing customers, verify results
- [ ] **Customer Details:** Click customer, verify all fields display
- [ ] **Customer Edit:** Edit customer, verify fields update
- [ ] **Visa Application List:** Navigate to Visa → Applications, verify loads
- [ ] **Dashboard:** Check dashboard metrics/widgets, verify no errors
- [ ] **Export/Reports:** Any customer-related exports, verify work

### Data Integrity
- [ ] [ ] Old records display correctly with new schema
- [ ] [ ] No data corruption in existing fields
- [ ] [ ] Relationships (applications → customers) still intact

---

## Performance Verification

### Database Query Performance
- [ ] Check query plan for search:
  ```sql
  EXPLAIN ANALYZE 
  SELECT id, full_name, email, phone, passport_number, nationality, created_at 
  FROM customers 
  WHERE full_name ILIKE '%test%' 
  LIMIT 10;
  ```
  Expected: Uses index scan on customers_full_name_idx

- [ ] Verify index statistics:
  ```sql
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
  FROM pg_stat_user_indexes 
  WHERE tablename = 'customers';
  ```

### Load Testing (Optional)
- [ ] Create 1000 test customers
- [ ] Verify INSERT performance remains acceptable
- [ ] Verify search performance with large dataset
- [ ] Verify no query timeouts

---

## Rollback Plan (If Issues Found)

Only execute if migration causes problems:

```sql
BEGIN;

-- Drop constraints
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_status_check;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_user_fk;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_country_fk;

-- Drop indexes
DROP INDEX IF EXISTS customers_email_unique;
DROP INDEX IF EXISTS customers_passport_number_unique;
DROP INDEX IF EXISTS customers_user_id_unique;
DROP INDEX IF EXISTS customers_full_name_idx;
DROP INDEX IF EXISTS customers_created_at_idx;
DROP INDEX IF EXISTS customers_country_id_idx;
DROP INDEX IF EXISTS customers_user_id_idx;

-- Drop columns
ALTER TABLE public.customers DROP COLUMN IF EXISTS full_name CASCADE;
ALTER TABLE public.customers DROP COLUMN IF EXISTS nationality CASCADE;
ALTER TABLE public.customers DROP COLUMN IF EXISTS date_of_birth CASCADE;
ALTER TABLE public.customers DROP COLUMN IF EXISTS notes CASCADE;
ALTER TABLE public.customers DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE public.customers DROP COLUMN IF EXISTS status CASCADE;
ALTER TABLE public.customers DROP COLUMN IF EXISTS country_id CASCADE;

COMMIT;
```

- [ ] Rollback executed successfully
- [ ] Customers table returned to 6-column schema
- [ ] All data in original 6 columns preserved
- [ ] Application errors resolved

---

## Sign-Off

### Verification Completed
- [ ] All schema verification tests passed
- [ ] All API tests passed
- [ ] All regression tests passed
- [ ] Performance verification passed

### Ready for Production
- [ ] Schema migration verified safe
- [ ] No code changes needed elsewhere
- [ ] All dependent systems compatible
- [ ] Rollback plan documented

**Verified By:** _____________________  
**Date:** _____________________  
**Notes:** _____________________

---

## Summary

After successful migration verification:
✅ Visa Application creation flow will work end-to-end  
✅ Customer module fully functional  
✅ All 13 columns present and usable  
✅ Existing data preserved  
✅ No code changes required  
✅ Performance optimized with indexes  
✅ Constraints enforced for data quality  

**Status:** Ready to promote to production
