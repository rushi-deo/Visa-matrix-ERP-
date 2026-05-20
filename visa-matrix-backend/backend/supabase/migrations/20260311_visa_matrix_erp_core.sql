create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.ensure_updated_at_trigger(trigger_name text, table_name regclass)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = trigger_name
      and tgrelid = table_name
  ) then
    execute format(
      'create trigger %I before update on %s for each row execute function public.set_updated_at()',
      trigger_name,
      table_name
    );
  end if;
end;
$$;

create or replace function public.add_constraint_if_absent(constraint_name text, ddl text)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = constraint_name
  ) then
    execute ddl;
  end if;
end;
$$;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  country_name text not null,
  country_code text not null,
  visa_required boolean not null default true,
  processing_time text,
  embassy_contact text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.countries add column if not exists country_name text;
alter table public.countries add column if not exists country_code text;
alter table public.countries add column if not exists visa_required boolean default true;
alter table public.countries add column if not exists processing_time text;
alter table public.countries add column if not exists embassy_contact text;
alter table public.countries add column if not exists notes text;
alter table public.countries add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.countries add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.countries
set country_name = coalesce(country_name, nullif(trim(name), ''))
where country_name is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'countries'
      and column_name = 'name'
  );

update public.countries
set country_code = upper(coalesce(country_code, code, iso2))
where country_code is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'countries'
      and column_name in ('code', 'iso2')
  );

update public.countries
set visa_required = coalesce(visa_required, true)
where visa_required is null;

create unique index if not exists countries_country_code_key
  on public.countries (country_code)
  where country_code is not null;

select public.ensure_updated_at_trigger('set_countries_updated_at_v2', 'public.countries');

create table if not exists public.visa_types (
  id uuid primary key default gen_random_uuid(),
  country_id uuid,
  visa_name text not null,
  visa_category text not null,
  processing_time text,
  visa_fee numeric(12, 2),
  requirements text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.visa_types add column if not exists country_id uuid;
alter table public.visa_types add column if not exists visa_name text;
alter table public.visa_types add column if not exists visa_category text;
alter table public.visa_types add column if not exists processing_time text;
alter table public.visa_types add column if not exists visa_fee numeric(12, 2);
alter table public.visa_types add column if not exists requirements text;
alter table public.visa_types add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.visa_types add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.visa_types
set visa_name = coalesce(visa_name, nullif(trim(name), ''))
where visa_name is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visa_types'
      and column_name = 'name'
  );

update public.visa_types
set visa_category = coalesce(visa_category, nullif(trim(code), ''), 'general')
where visa_category is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visa_types'
      and column_name = 'code'
  );

update public.visa_types
set processing_time = coalesce(processing_time, processing_days::text)
where processing_time is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visa_types'
      and column_name = 'processing_days'
  );

update public.visa_types
set visa_fee = coalesce(visa_fee, fee)
where visa_fee is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visa_types'
      and column_name = 'fee'
  );

update public.visa_types
set requirements = coalesce(requirements, description)
where requirements is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visa_types'
      and column_name = 'description'
  );

select public.add_constraint_if_absent(
  'visa_types_country_id_fkey_v2',
  'alter table public.visa_types add constraint visa_types_country_id_fkey_v2 foreign key (country_id) references public.countries(id) on update cascade on delete restrict'
);

select public.ensure_updated_at_trigger('set_visa_types_updated_at_v2', 'public.visa_types');

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  passport_number text,
  nationality text,
  date_of_birth date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.customers add column if not exists full_name text;
alter table public.customers add column if not exists email text;
alter table public.customers add column if not exists phone text;
alter table public.customers add column if not exists passport_number text;
alter table public.customers add column if not exists nationality text;
alter table public.customers add column if not exists date_of_birth date;
alter table public.customers add column if not exists notes text;
alter table public.customers add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.customers add column if not exists updated_at timestamptz not null default timezone('utc', now());

create unique index if not exists customers_email_unique_v2
  on public.customers (lower(email))
  where email is not null;

create unique index if not exists customers_passport_number_unique_v2
  on public.customers (passport_number)
  where passport_number is not null;

select public.ensure_updated_at_trigger('set_customers_updated_at_v2', 'public.customers');

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  country_id uuid,
  visa_type_id uuid,
  application_status text not null default 'draft',
  submission_date date,
  embassy_date date,
  decision_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.applications add column if not exists customer_id uuid;
alter table public.applications add column if not exists country_id uuid;
alter table public.applications add column if not exists visa_type_id uuid;
alter table public.applications add column if not exists application_status text default 'draft';
alter table public.applications add column if not exists submission_date date;
alter table public.applications add column if not exists embassy_date date;
alter table public.applications add column if not exists decision_date date;
alter table public.applications add column if not exists notes text;
alter table public.applications add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.applications add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.applications
set application_status = case lower(coalesce(application_status, status, 'draft'))
  when 'submitted' then 'submitted'
  when 'under_review' then 'under_review'
  when 'under review' then 'under_review'
  when 'embassy_processing' then 'embassy_processing'
  when 'embassy processing' then 'embassy_processing'
  when 'approved' then 'approved'
  when 'rejected' then 'rejected'
  else 'draft'
end;

update public.applications
set submission_date = coalesce(submission_date, created_at::date, travel_date)
where submission_date is null;

update public.applications
set decision_date = coalesce(decision_date, updated_at::date)
where decision_date is null
  and application_status in ('approved', 'rejected');

select public.add_constraint_if_absent(
  'applications_customer_id_fkey_v2',
  'alter table public.applications add constraint applications_customer_id_fkey_v2 foreign key (customer_id) references public.customers(id) on update cascade on delete restrict'
);

select public.add_constraint_if_absent(
  'applications_country_id_fkey_v2',
  'alter table public.applications add constraint applications_country_id_fkey_v2 foreign key (country_id) references public.countries(id) on update cascade on delete restrict'
);

select public.add_constraint_if_absent(
  'applications_visa_type_id_fkey_v2',
  'alter table public.applications add constraint applications_visa_type_id_fkey_v2 foreign key (visa_type_id) references public.visa_types(id) on update cascade on delete restrict'
);

select public.add_constraint_if_absent(
  'applications_status_check_v2',
  $$alter table public.applications add constraint applications_status_check_v2 check (
    application_status in ('draft', 'submitted', 'under_review', 'embassy_processing', 'approved', 'rejected')
  )$$
);

select public.ensure_updated_at_trigger('set_applications_updated_at_v2', 'public.applications');

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  document_type text not null,
  file_url text not null,
  verification_status text not null default 'pending',
  uploaded_at timestamptz not null default timezone('utc', now()),
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.documents add column if not exists application_id uuid;
alter table public.documents add column if not exists document_type text;
alter table public.documents add column if not exists file_url text;
alter table public.documents add column if not exists verification_status text default 'pending';
alter table public.documents add column if not exists uploaded_at timestamptz not null default timezone('utc', now());
alter table public.documents add column if not exists storage_path text;
alter table public.documents add column if not exists file_name text;
alter table public.documents add column if not exists mime_type text;
alter table public.documents add column if not exists size_bytes bigint;
alter table public.documents add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.documents add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.documents
set verification_status = coalesce(verification_status, status, 'pending')
where verification_status is null;

select public.add_constraint_if_absent(
  'documents_application_id_fkey_v2',
  'alter table public.documents add constraint documents_application_id_fkey_v2 foreign key (application_id) references public.applications(id) on update cascade on delete cascade'
);

select public.ensure_updated_at_trigger('set_documents_updated_at_v2', 'public.documents');

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  invoice_number text,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  payment_status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.payments add column if not exists application_id uuid;
alter table public.payments add column if not exists invoice_number text;
alter table public.payments add column if not exists amount numeric(12, 2) not null default 0;
alter table public.payments add column if not exists currency text not null default 'USD';
alter table public.payments add column if not exists payment_status text not null default 'pending';
alter table public.payments add column if not exists payment_method text;
alter table public.payments add column if not exists paid_at timestamptz;
alter table public.payments add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.payments add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.payments
set invoice_number = coalesce(invoice_number, invoice_no, 'INV-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' || upper(substr(replace(id::text, '-', ''), 1, 8)))
where invoice_number is null;

update public.payments
set payment_status = case lower(coalesce(payment_status, 'pending'))
  when 'paid' then 'paid'
  when 'failed' then 'failed'
  else 'pending'
end;

update public.payments
set paid_at = coalesce(paid_at, updated_at)
where payment_status = 'paid'
  and paid_at is null;

create unique index if not exists payments_invoice_number_unique_v2
  on public.payments (invoice_number)
  where invoice_number is not null;

select public.add_constraint_if_absent(
  'payments_application_id_fkey_v2',
  'alter table public.payments add constraint payments_application_id_fkey_v2 foreign key (application_id) references public.applications(id) on update cascade on delete cascade'
);

select public.add_constraint_if_absent(
  'payments_status_check_v2',
  $$alter table public.payments add constraint payments_status_check_v2 check (
    payment_status in ('pending', 'paid', 'failed')
  )$$
);

select public.ensure_updated_at_trigger('set_payments_updated_at_v2', 'public.payments');

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  stage text not null default 'application_received',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.workflows add column if not exists application_id uuid;
alter table public.workflows add column if not exists stage text default 'application_received';
alter table public.workflows add column if not exists notes text;
alter table public.workflows add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.workflows add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.workflows
set stage = coalesce(stage, 'application_received')
where stage is null;

select public.add_constraint_if_absent(
  'workflows_application_id_fkey_v2',
  'alter table public.workflows add constraint workflows_application_id_fkey_v2 foreign key (application_id) references public.applications(id) on update cascade on delete cascade'
);

select public.add_constraint_if_absent(
  'workflows_stage_check_v2',
  $$alter table public.workflows add constraint workflows_stage_check_v2 check (
    stage in ('application_received', 'documents_pending', 'documents_verified', 'embassy_submitted', 'decision_pending', 'completed')
  )$$
);

select public.ensure_updated_at_trigger('set_workflows_updated_at_v2', 'public.workflows');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  task_title text not null,
  task_description text,
  assigned_to text,
  due_date date,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'assigned_to'
      and data_type <> 'text'
  ) then
    alter table public.tasks
      alter column assigned_to type text using assigned_to::text;
  end if;
end;
$$;

alter table public.tasks add column if not exists application_id uuid;
alter table public.tasks add column if not exists task_title text;
alter table public.tasks add column if not exists task_description text;
alter table public.tasks add column if not exists assigned_to text;
alter table public.tasks add column if not exists due_date date;
alter table public.tasks add column if not exists status text default 'pending';
alter table public.tasks add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.tasks add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.tasks
set task_title = coalesce(task_title, title)
where task_title is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'title'
  );

update public.tasks
set task_description = coalesce(task_description, description)
where task_description is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'description'
  );

update public.tasks
set due_date = coalesce(due_date, due_at::date)
where due_date is null
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'due_at'
  );

update public.tasks
set status = coalesce(status, 'pending')
where status is null;

select public.add_constraint_if_absent(
  'tasks_application_id_fkey_v2',
  'alter table public.tasks add constraint tasks_application_id_fkey_v2 foreign key (application_id) references public.applications(id) on update cascade on delete cascade'
);

select public.ensure_updated_at_trigger('set_tasks_updated_at_v2', 'public.tasks');

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text,
  related_application uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists type text;
alter table public.notifications add column if not exists related_application uuid;
alter table public.notifications add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.notifications add column if not exists updated_at timestamptz not null default timezone('utc', now());

select public.add_constraint_if_absent(
  'notifications_related_application_fkey_v2',
  'alter table public.notifications add constraint notifications_related_application_fkey_v2 foreign key (related_application) references public.applications(id) on update cascade on delete set null'
);

select public.ensure_updated_at_trigger('set_notifications_updated_at_v2', 'public.notifications');

alter table public.countries disable row level security;
alter table public.visa_types disable row level security;
alter table public.customers disable row level security;
alter table public.applications disable row level security;
alter table public.documents disable row level security;
alter table public.payments disable row level security;
alter table public.workflows disable row level security;
alter table public.tasks disable row level security;
alter table public.notifications disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.countries to anon, authenticated;
grant select, insert, update, delete on table public.visa_types to anon, authenticated;
grant select, insert, update, delete on table public.customers to anon, authenticated;
grant select, insert, update, delete on table public.applications to anon, authenticated;
grant select, insert, update, delete on table public.documents to anon, authenticated;
grant select, insert, update, delete on table public.payments to anon, authenticated;
grant select, insert, update, delete on table public.workflows to anon, authenticated;
grant select, insert, update, delete on table public.tasks to anon, authenticated;
grant select, insert, update, delete on table public.notifications to anon, authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('visa-documents', 'visa-documents', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'visa_documents_public_select'
  ) then
    create policy visa_documents_public_select
      on storage.objects
      for select
      to public
      using (bucket_id = 'visa-documents');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'visa_documents_public_insert'
  ) then
    create policy visa_documents_public_insert
      on storage.objects
      for insert
      to public
      with check (bucket_id = 'visa-documents');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'visa_documents_public_update'
  ) then
    create policy visa_documents_public_update
      on storage.objects
      for update
      to public
      using (bucket_id = 'visa-documents')
      with check (bucket_id = 'visa-documents');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'visa_documents_public_delete'
  ) then
    create policy visa_documents_public_delete
      on storage.objects
      for delete
      to public
      using (bucket_id = 'visa-documents');
  end if;
end;
$$;
