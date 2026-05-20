grant usage on schema public to anon, authenticated, service_role;

grant all on table public.visa_fees_import to service_role;
grant select on table public.visa_fees_import to anon, authenticated;

alter table public.visa_fees_import disable row level security;

notify pgrst, 'reload schema';

select 'Diagnostic' as status, count(*) as total_rows
from public.visa_fees_import;
