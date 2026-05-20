alter table public.invoices add column if not exists country text;
alter table public.invoices add column if not exists visa_type text;
alter table public.invoices add column if not exists govt_fee numeric(12, 2);
alter table public.invoices add column if not exists service_fee numeric(12, 2);
alter table public.invoices add column if not exists consultation_fee numeric(12, 2);
alter table public.invoices add column if not exists gst_percent numeric(12, 2);
alter table public.invoices add column if not exists gst_amount numeric(12, 2);
