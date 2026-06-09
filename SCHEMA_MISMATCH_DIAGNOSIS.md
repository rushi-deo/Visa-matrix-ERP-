# SCHEMA MISMATCH ANALYSIS - PGRST204 ERROR

## Error Summary

```
PGRST204: Could not find the 'full_name' column of 'customers' in the schema cache
```

**What this means:** Your Supabase database has a `customers` table, but it does NOT have a `full_name` column. When the backend tries to INSERT with `full_name`, Supabase rejects it.

---

## REQUEST FLOW TRACED

### 1. Frontend (ApplicationCreateDialog.tsx) - Lines 191-195
```javascript
const customerPayload = {
  full_name: fullName,           // ← Frontend sends this
  email,
  phone,
  passport_number: passportNumber,
};
const customerResp = await apiClient.post("/customers", customerPayload);
```

**Status:** ✅ Frontend sends correct field names

---

### 2. Backend Route Validation (customer.routes.js) - Lines 24-32
```javascript
const customerBodySchema = z.object({
  full_name: z.string().min(2).max(120).optional(),    // ← Expects this
  email: z.string().email().optional(),
  phone: z.string().min(6).max(30).optional(),
  passport_number: z.string().min(3).max(50).optional(),
  nationality: z.string().min(2).max(100).optional(),
}).passthrough();
```

**Status:** ✅ Backend accepts correct field names

---

### 3. Backend Service Layer (customer.service.js)
```javascript
export const createCustomerRecord = async (payload) => 
  createCustomer(payload);  // Just passes through
```

**Status:** ✅ No transformation

---

### 4. Backend Repository (customer.repository.js) - Line 10
```javascript
export const createCustomer = (payload) => 
  customerCrudRepository.create(payload);
```

**Status:** ✅ No transformation

---

### 5. CRUD Repository (baseRepository.js) - Line 90
```javascript
const { data, error } = await supabase
  .from(tableName)          // "customers"
  .insert(payload)          // { full_name, email, phone, passport_number }
  .select(select)           // "*"
  .single();
```

**Execution:** Tries to insert into Supabase with payload containing `full_name`

**Result:** ❌ ERROR - Supabase can't find `full_name` column

---

## ROOT CAUSE

Your Supabase `customers` table schema **does NOT match** what the migrations define.

### Expected Schema (from migrations)
Migration 20260310 creates:
- `id` (uuid, PK)
- `user_id` (uuid)
- **`full_name` (text, NOT NULL)** ← **NOT IN YOUR DATABASE**
- `first_name` (text)
- `middle_name` (text)
- `last_name` (text)
- `email` (text)
- `phone` (text)
- `country_id` (uuid)
- `status` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Then migration 20260311 adds:
- `passport_number` (text) ← Might also be missing
- `nationality` (text) ← Might also be missing
- `date_of_birth` (date) ← Might also be missing
- `notes` (text) ← Might also be missing

### Actual Schema (in your Supabase)
Unknown - but **does NOT include `full_name`** column

---

## TO DETERMINE EXACT MISMATCH

Run the diagnostic script:

```bash
cd visa-matrix-backend/backend
node diagnose-schema.js
```

This will show:
- What columns your `customers` table ACTUALLY has
- What columns the code expects
- Which columns are missing

---

## SOLUTION OPTIONS

### Option 1: Apply Migrations (Simplest - if not already done)

If your Supabase migrations haven't been applied:

```bash
cd visa-matrix-backend/backend
supabase db push
```

This will apply all migrations in order and create the expected schema.

### Option 2: Update Code to Map to Existing Columns (If you cannot modify DB schema)

If Option 1 is not possible, modify these files to map to your actual columns:

#### File 1: backend/src/modules/customers/customer.routes.js
Change schema to accept whatever columns your table has.

#### File 2: backend/src/core/baseRepository.js  
Add column mapping transformation before insert.

#### File 3: frontend ApplicationCreateDialog.tsx
Send only the columns that exist in your database.

---

## NEXT STEPS

1. **Run diagnostic script** to see what you actually have
2. **Report the output** showing actual vs expected columns
3. **Then we can create targeted fixes** for those specific columns

Command to run:
```bash
cd /Users/nisha/Downloads/Visa-matrix-ERP-/visa-matrix-backend/backend
node diagnose-schema.js
```

This will give us the exact column mismatch, and I can provide precise code fixes.
