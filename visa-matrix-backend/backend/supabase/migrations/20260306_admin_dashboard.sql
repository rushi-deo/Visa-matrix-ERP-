create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (
    role in (
      'super_admin',
      'visa_officer',
      'documentation',
      'accounts',
      'marketing'
    )
  ),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_users enable row level security;

alter table public.applications
  add column if not exists reference_no text;

with numbered_applications as (
  select
    id,
    to_char(coalesce(created_at, timezone('utc', now())), 'YYYY') as ref_year,
    row_number() over (
      partition by to_char(coalesce(created_at, timezone('utc', now())), 'YYYY')
      order by coalesce(created_at, timezone('utc', now())), id
    ) as row_num
  from public.applications
  where reference_no is null
)
update public.applications as applications
set reference_no = 'VMX-' || numbered_applications.ref_year || '-' || lpad(numbered_applications.row_num::text, 4, '0')
from numbered_applications
where applications.id = numbered_applications.id;

create unique index if not exists applications_reference_no_key
  on public.applications (reference_no)
  where reference_no is not null;

insert into storage.buckets (id, name, public)
values ('visa-documents', 'visa-documents', true)
on conflict (id) do nothing;
