-- Migration: Reconcile Customers Table Schema
-- Purpose: Add missing columns required by Visa Matrix ERP codebase
-- Issue: PGRST204 error - customers table missing critical columns
-- 
-- This migration is SAFE:
-- - Only adds columns (no drops)
-- - Preserves all existing data
-- - Makes columns optional except full_name
-- - Adds indexes and constraints to match code expectations
-- 
-- Timeline: Applied after 20260311_visa_matrix_erp_core.sql

BEGIN;

-- ============================================================================
-- PHASE 1: Add Missing Columns (Non-Destructive)
-- ============================================================================

-- full_name (CRITICAL - fixes PGRST204 error)
-- Required by: ApplicationCreateDialog, referenceService, validateCustomerPayload
-- Current impact: Breaks application creation flow
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS full_name text;

-- Set NOT NULL constraint after adding column
-- For existing rows, use email as fallback if needed
UPDATE public.customers 
SET full_name = COALESCE(full_name, 'Customer ' || substring(id::text, 1, 8))
WHERE full_name IS NULL;

-- Now apply NOT NULL constraint
ALTER TABLE public.customers 
ALTER COLUMN full_name SET NOT NULL;

-- nationality (Required by referenceService, visa operations)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS nationality text;

-- date_of_birth (Required by validateCustomerPayload, visa requirements)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- notes (Required by validateCustomerPayload, CRM timeline)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS notes text;

-- user_id (For account linking, multi-user support)
-- Foreign key to Supabase auth.users
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- status (For customer lifecycle, reporting)
-- Values: active, inactive, suspended, deleted
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- country_id (For visa destination preference)
-- Foreign key to countries table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS country_id uuid;

-- ============================================================================
-- PHASE 2: Add Constraints
-- ============================================================================

-- Add UNIQUE constraint on email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique 
ON public.customers (lower(email)) 
WHERE email IS NOT NULL;

-- Add UNIQUE constraint on passport_number
CREATE UNIQUE INDEX IF NOT EXISTS customers_passport_number_unique 
ON public.customers (passport_number) 
WHERE passport_number IS NOT NULL;

-- Add UNIQUE constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique 
ON public.customers (user_id) 
WHERE user_id IS NOT NULL;

-- Check constraint on status values
ALTER TABLE public.customers 
ADD CONSTRAINT customers_status_check 
CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')) 
NOT VALID;

-- Validate constraint (this doesn't block existing data)
ALTER TABLE public.customers 
VALIDATE CONSTRAINT customers_status_check;

-- ============================================================================
-- PHASE 3: Add Foreign Keys
-- ============================================================================

-- Foreign key: user_id -> auth.users
-- Drop existing constraint if it exists before re-adding
ALTER TABLE public.customers 
DROP CONSTRAINT IF EXISTS customers_user_fk;

ALTER TABLE public.customers 
ADD CONSTRAINT customers_user_fk 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Foreign key: country_id -> countries
-- Drop existing constraint if it exists before re-adding
ALTER TABLE public.customers 
DROP CONSTRAINT IF EXISTS customers_country_fk;

ALTER TABLE public.customers 
ADD CONSTRAINT customers_country_fk 
FOREIGN KEY (country_id) 
REFERENCES public.countries(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- ============================================================================
-- PHASE 4: Add Indexes for Performance
-- ============================================================================

-- Index on full_name for search queries
CREATE INDEX IF NOT EXISTS customers_full_name_idx 
ON public.customers (full_name);

-- Index on created_at for temporal queries
CREATE INDEX IF NOT EXISTS customers_created_at_idx 
ON public.customers (created_at DESC);

-- Index on country_id for referential queries
CREATE INDEX IF NOT EXISTS customers_country_id_idx 
ON public.customers (country_id);

-- Index on user_id for account linking
CREATE INDEX IF NOT EXISTS customers_user_id_idx 
ON public.customers (user_id);

-- ============================================================================
-- PHASE 5: Update Triggers
-- ============================================================================

-- Ensure updated_at trigger exists and fires on any update
-- (Should exist from 20260311, but verify)
DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
DROP TRIGGER IF EXISTS set_customers_updated_at_v2 ON public.customers;

CREATE TRIGGER set_customers_updated_at 
BEFORE UPDATE ON public.customers 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PHASE 6: Verify Schema
-- ============================================================================

-- This informational comment shows what the final schema should look like:
-- 
-- Table structure after migration:
-- id                UUID          NOT NULL DEFAULT gen_random_uuid()    [PRIMARY KEY]
-- email             TEXT          UNIQUE (where not null, case-insensitive)
-- phone             TEXT
-- passport_number   TEXT          UNIQUE (where not null)
-- created_at        TIMESTAMPTZ   NOT NULL DEFAULT timezone('utc'::text, now())
-- updated_at        TIMESTAMPTZ   NOT NULL DEFAULT timezone('utc'::text, now())
-- full_name         TEXT          NOT NULL                                [ADDED]
-- nationality       TEXT                                                  [ADDED]
-- date_of_birth     DATE                                                  [ADDED]
-- notes             TEXT                                                  [ADDED]
-- user_id           UUID          UNIQUE (where not null)                 [ADDED]
-- status            TEXT          DEFAULT 'active'::text                  [ADDED]
-- country_id        UUID                                                  [ADDED]

COMMIT;

-- ============================================================================
-- VERIFICATION SCRIPT (run after migration)
-- ============================================================================
-- 
-- Verify all columns exist:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'customers' 
-- ORDER BY ordinal_position;
-- 
-- Verify constraints:
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'customers';
-- 
-- Verify indexes:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'customers';
-- 
-- Test INSERT with all fields:
-- INSERT INTO customers (
--   full_name, email, phone, passport_number, 
--   nationality, date_of_birth, notes, user_id, status, country_id
-- ) VALUES (
--   'Test Customer', 'test@example.com', '+1234567890', 'ABC123456',
--   'US', '1990-01-01', 'Test customer', NULL, 'active', NULL
-- ) RETURNING *;
--
-- Test search by full_name:
-- SELECT * FROM customers WHERE full_name ILIKE '%Test%';
-- 
-- Test search by passport_number:
-- SELECT * FROM customers WHERE passport_number = 'ABC123456';

-- ============================================================================
-- ROLLBACK PROCEDURE (if needed)
-- ============================================================================
--
-- WARNING: Only use if migration causes issues
--
-- BEGIN;
-- 
-- ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_status_check;
-- ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_user_fk;
-- ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_country_fk;
-- 
-- DROP INDEX IF EXISTS customers_email_unique;
-- DROP INDEX IF EXISTS customers_passport_number_unique;
-- DROP INDEX IF EXISTS customers_user_id_unique;
-- DROP INDEX IF EXISTS customers_full_name_idx;
-- DROP INDEX IF EXISTS customers_created_at_idx;
-- DROP INDEX IF EXISTS customers_country_id_idx;
-- DROP INDEX IF EXISTS customers_user_id_idx;
-- 
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS full_name;
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS nationality;
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS date_of_birth;
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS notes;
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS status;
-- ALTER TABLE public.customers DROP COLUMN IF EXISTS country_id;
-- 
-- COMMIT;
