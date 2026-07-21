alter table public.form_configs
  add column if not exists name text;

alter table public.form_configs
  add column if not exists version integer not null default 1;

alter table public.form_configs
  add column if not exists status text not null default 'draft';

update public.form_configs fc
set name = concat_ws(' - ', c.country_name, vt.visa_name)
from public.countries c,
     public.visa_types vt
where fc.country_id = c.id
  and fc.visa_type_id = vt.id
  and (fc.name is null or btrim(fc.name) = '');

update public.form_configs
set name = coalesce(nullif(btrim(name), ''), 'Untitled Form'),
    version = coalesce(version, 1),
    status = coalesce(status, 'draft');

select public.ensure_updated_at_trigger('set_form_configs_updated_at_v2', 'public.form_configs');

select public.add_constraint_if_absent(
  'form_configs_status_check_v2',
  $$alter table public.form_configs add constraint form_configs_status_check_v2 check (status in ('draft', 'published', 'archived'))$$
);
