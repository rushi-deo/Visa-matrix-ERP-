-- Establish customer organization ownership without inventing legacy ownership.

BEGIN;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS organization_id uuid;

CREATE TABLE IF NOT EXISTS public.customer_ownership_quarantine (
  customer_id uuid PRIMARY KEY,
  reason text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT customer_ownership_quarantine_customer_fk
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);

-- The customer-to-profile relationship is the only trusted existing path to
-- an organization: customers.user_id references profiles.id.
UPDATE public.customers AS customer
SET organization_id = profile.organization_id
FROM public.profiles AS profile
WHERE customer.organization_id IS NULL
  AND customer.user_id = profile.id
  AND profile.organization_id IS NOT NULL;

INSERT INTO public.customer_ownership_quarantine (customer_id, reason)
SELECT
  customer.id,
  CASE
    WHEN customer.user_id IS NULL THEN 'Customer has no linked profile.'
    WHEN profile.id IS NULL THEN 'Linked customer profile does not exist.'
    WHEN profile.organization_id IS NULL THEN 'Linked customer profile has no organization.'
    ELSE 'Customer organization ownership is unresolved.'
  END
FROM public.customers AS customer
LEFT JOIN public.profiles AS profile ON profile.id = customer.user_id
WHERE customer.organization_id IS NULL
ON CONFLICT (customer_id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_organization_fk'
      AND conrelid = 'public.customers'::regclass
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_organization_fk
      FOREIGN KEY (organization_id)
      REFERENCES public.organizations(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_organization_required'
      AND conrelid = 'public.customers'::regclass
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_organization_required
      CHECK (organization_id IS NOT NULL) NOT VALID;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS customers_organization_id_idx
  ON public.customers (organization_id);

COMMIT;