-- Make the existing visa-documents bucket private and remove only the four
-- unrestricted public policies created by the legacy core migration.
-- Do not apply until the live project has been inspected and approved.

BEGIN;

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL OR to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Supabase Storage is unavailable; inspect the project before applying this repair.';
  END IF;

  UPDATE storage.buckets
  SET public = false
  WHERE id = 'visa-documents';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The visa-documents bucket was not found; inspect storage before applying this repair.';
  END IF;

  DROP POLICY IF EXISTS visa_documents_public_select ON storage.objects;
  DROP POLICY IF EXISTS visa_documents_public_insert ON storage.objects;
  DROP POLICY IF EXISTS visa_documents_public_update ON storage.objects;
  DROP POLICY IF EXISTS visa_documents_public_delete ON storage.objects;
END;
$$;

COMMIT;
