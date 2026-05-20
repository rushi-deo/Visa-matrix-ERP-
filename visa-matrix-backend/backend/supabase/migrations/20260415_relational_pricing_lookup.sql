create extension if not exists pgcrypto;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text,
  country_name text,
  country_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.countries add column if not exists name text;
alter table public.countries add column if not exists country_name text;
alter table public.countries add column if not exists country_code text;

update public.countries
set name = nullif(trim(country_name), '')
where (name is null or trim(name) = '')
  and country_name is not null
  and trim(country_name) <> '';

update public.countries
set country_name = nullif(trim(name), '')
where (country_name is null or trim(country_name) = '')
  and name is not null
  and trim(name) <> '';

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'countries_name_unique_idx'
  ) and not exists (
    select lower(trim(name))
    from public.countries
    where name is not null
      and trim(name) <> ''
    group by 1
    having count(*) > 1
  ) then
    execute $sql$
      create unique index countries_name_unique_idx
      on public.countries (lower(trim(name)))
      where name is not null and trim(name) <> ''
    $sql$;
  end if;
end;
$$;

create table if not exists public.visa_types (
  id uuid primary key default gen_random_uuid(),
  country_id uuid,
  name text,
  visa_name text,
  visa_category text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.visa_types add column if not exists name text;
alter table public.visa_types add column if not exists country_id uuid;
alter table public.visa_types add column if not exists visa_name text;
alter table public.visa_types add column if not exists visa_category text;

update public.visa_types
set name = nullif(trim(visa_name), '')
where (name is null or trim(name) = '')
  and visa_name is not null
  and trim(visa_name) <> '';

update public.visa_types
set visa_name = nullif(trim(name), '')
where (visa_name is null or trim(visa_name) = '')
  and name is not null
  and trim(name) <> '';

update public.visa_types
set visa_category = coalesce(nullif(trim(visa_category), ''), 'general')
where visa_category is null
   or trim(visa_category) = '';

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'visa_types_master_name_unique_idx'
  ) and not exists (
    select lower(trim(name))
    from public.visa_types
    where name is not null
      and trim(name) <> ''
      and country_id is null
    group by 1
    having count(*) > 1
  ) then
    execute $sql$
      create unique index visa_types_master_name_unique_idx
      on public.visa_types (lower(trim(name)))
      where name is not null and trim(name) <> '' and country_id is null
    $sql$;
  end if;
end;
$$;

alter table public.applications add column if not exists country_id uuid;
alter table public.applications add column if not exists visa_type_id uuid;
alter table public.applications add column if not exists country_name text;
alter table public.applications add column if not exists visa_type text;

alter table if exists public.visa_fees_import add column if not exists country_id uuid;
alter table if exists public.visa_fees_import add column if not exists visa_type_id uuid;
alter table if exists public.visa_fees_import add column if not exists country_name text;
alter table if exists public.visa_fees_import add column if not exists visa_type text;

insert into public.countries (name, country_name, country_code)
select distinct
  trim(v.country_name),
  trim(v.country_name),
  upper(substr(md5(lower(trim(v.country_name))), 1, 8))
from public.visa_fees_import v
where v.country_name is not null
  and trim(v.country_name) <> ''
  and not exists (
    select 1
    from public.countries c
    where lower(trim(c.name)) = lower(trim(v.country_name))
  );

insert into public.visa_types (name, visa_name, visa_category, country_id)
select distinct
  trim(v.visa_type),
  trim(v.visa_type),
  'general',
  null
from public.visa_fees_import v
where v.visa_type is not null
  and trim(v.visa_type) <> ''
  and not exists (
    select 1
    from public.visa_types vt
    where lower(trim(vt.name)) = lower(trim(v.visa_type))
      and vt.country_id is null
  );

update public.visa_fees_import v
set country_id = c.id
from public.countries c
where (v.country_id is null or v.country_id <> c.id)
  and v.country_name is not null
  and trim(v.country_name) <> ''
  and lower(trim(v.country_name)) = lower(trim(c.name));

update public.visa_fees_import v
set visa_type_id = vt.id
from public.visa_types vt
where (v.visa_type_id is null or v.visa_type_id <> vt.id)
  and v.visa_type is not null
  and trim(v.visa_type) <> ''
  and vt.country_id is null
  and lower(trim(v.visa_type)) = lower(trim(vt.name));

update public.applications a
set country_id = c.id
from public.countries c
where (a.country_id is null or a.country_id <> c.id)
  and a.country_name is not null
  and trim(a.country_name) <> ''
  and lower(trim(a.country_name)) = lower(trim(c.name));

update public.applications a
set visa_type_id = vt.id
from public.visa_types vt
where (a.visa_type_id is null or a.visa_type_id <> vt.id)
  and a.visa_type is not null
  and trim(a.visa_type) <> ''
  and vt.country_id is null
  and lower(trim(a.visa_type)) = lower(trim(vt.name));

do $$
begin
  if to_regclass('public.visa_fees_import') is not null and not exists (
    select 1
    from pg_constraint
    where conname = 'visa_fees_import_country_id_fkey'
  ) then
    execute 'alter table public.visa_fees_import add constraint visa_fees_import_country_id_fkey foreign key (country_id) references public.countries(id) on update cascade on delete set null';
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.visa_fees_import') is not null and not exists (
    select 1
    from pg_constraint
    where conname = 'visa_fees_import_visa_type_id_fkey'
  ) then
    execute 'alter table public.visa_fees_import add constraint visa_fees_import_visa_type_id_fkey foreign key (visa_type_id) references public.visa_types(id) on update cascade on delete set null';
  end if;
end;
$$;

create index if not exists applications_country_id_idx
  on public.applications (country_id);

create index if not exists applications_visa_type_id_idx
  on public.applications (visa_type_id);

do $$
begin
  if to_regclass('public.visa_fees_import') is not null then
    execute 'create index if not exists visa_fees_import_country_id_idx on public.visa_fees_import (country_id)';
    execute 'create index if not exists visa_fees_import_visa_type_id_idx on public.visa_fees_import (visa_type_id)';
    execute 'create index if not exists visa_fees_import_country_visa_idx on public.visa_fees_import (country_id, visa_type_id)';
  end if;
end;
$$;

notify pgrst, 'reload schema';
