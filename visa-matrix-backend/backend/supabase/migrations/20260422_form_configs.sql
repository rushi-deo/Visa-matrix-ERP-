create extension if not exists "uuid-ossp";

create table if not exists public.form_configs (
  id uuid primary key default uuid_generate_v4(),
  country_id uuid not null references public.countries(id) on update cascade on delete cascade,
  visa_type_id uuid not null references public.visa_types(id) on update cascade on delete cascade,
  form_schema jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint form_configs_country_visa_type_unique unique (country_id, visa_type_id)
);

select public.ensure_updated_at_trigger('set_form_configs_updated_at', 'public.form_configs');

insert into public.form_configs (country_id, visa_type_id, form_schema)
select
  '3d778394-2f16-491c-81a5-944fa92819e6'::uuid,
  '9f1228b6-8a74-42af-a1cb-6eddbbe0fe28'::uuid,
  '{
    "sections": [
      {
        "title": "Financial Info",
        "fields": [
          {
            "id": "bank_balance",
            "label": "Bank Balance",
            "type": "number",
            "required": true
          }
        ]
      },
      {
        "title": "Travel Info",
        "fields": [
          {
            "id": "passport_validity_months",
            "label": "Passport Validity (Months)",
            "type": "number",
            "required": true
          },
          {
            "id": "travel_history_count",
            "label": "Travel History Count",
            "type": "number"
          },
          {
            "id": "employment_status",
            "label": "Employment Status",
            "type": "select",
            "options": ["employed", "unemployed", "student"]
          }
        ]
      }
    ]
  }'::jsonb
where exists (
  select 1
  from public.countries
  where id = '3d778394-2f16-491c-81a5-944fa92819e6'::uuid
)
and exists (
  select 1
  from public.visa_types
  where id = '9f1228b6-8a74-42af-a1cb-6eddbbe0fe28'::uuid
)
on conflict (country_id, visa_type_id)
do update set
  form_schema = excluded.form_schema,
  updated_at = timezone('utc', now());

alter table public.form_configs disable row level security;
grant select, insert, update, delete on table public.form_configs to anon, authenticated;
