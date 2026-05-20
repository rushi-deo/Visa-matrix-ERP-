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

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.ensure_updated_at_trigger('set_roles_updated_at', 'public.roles');

insert into public.roles (code, name, description)
values
  ('admin', 'Admin', 'ERP administrators'),
  ('manager', 'Manager', 'Operations and reporting managers'),
  ('agent', 'Agent', 'Case processing agents'),
  ('customer', 'Customer', 'Visa applicants and customers')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'customer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists password text;
alter table public.users add column if not exists role text default 'customer';
alter table public.users add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.users add column if not exists updated_at timestamptz not null default timezone('utc', now());

create unique index if not exists users_email_key on public.users (email);
select public.add_constraint_if_absent(
  'users_role_fk',
  'alter table public.users add constraint users_role_fk foreign key (role) references public.roles(code) on update cascade'
);
select public.ensure_updated_at_trigger('set_users_updated_at', 'public.users');

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'name'
  ) then
    execute $sql$
      update public.users
      set full_name = coalesce(full_name, nullif(trim(name), ''))
      where full_name is null or trim(full_name) = ''
    $sql$;
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.admin_users') is not null then
    insert into public.users (full_name, email, password, role, created_at, updated_at)
    select
      coalesce(nullif(trim(name), ''), lower(email)),
      lower(email),
      password_hash,
      case
        when role = 'super_admin' then 'admin'
        when role in ('visa_officer', 'documentation') then 'agent'
        when role in ('accounts', 'marketing') then 'manager'
        else 'admin'
      end,
      coalesce(created_at, timezone('utc', now())),
      coalesce(created_at, timezone('utc', now()))
    from public.admin_users
    on conflict (email) do update
    set
      full_name = excluded.full_name,
      password = coalesce(public.users.password, excluded.password),
      role = coalesce(public.users.role, excluded.role);
  end if;
end;
$$;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  iso2 text,
  region text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.countries add column if not exists name text;
alter table public.countries add column if not exists code text;
alter table public.countries add column if not exists iso2 text;
alter table public.countries add column if not exists region text;
alter table public.countries add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.countries add column if not exists updated_at timestamptz not null default timezone('utc', now());
select public.ensure_updated_at_trigger('set_countries_updated_at', 'public.countries');

create table if not exists public.visa_types (
  id uuid primary key default gen_random_uuid(),
  country_id uuid,
  name text not null,
  code text,
  description text,
  processing_days integer,
  fee numeric(12, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.visa_types add column if not exists country_id uuid;
alter table public.visa_types add column if not exists name text;
alter table public.visa_types add column if not exists code text;
alter table public.visa_types add column if not exists description text;
alter table public.visa_types add column if not exists processing_days integer;
alter table public.visa_types add column if not exists fee numeric(12, 2);
alter table public.visa_types add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.visa_types add column if not exists updated_at timestamptz not null default timezone('utc', now());
select public.add_constraint_if_absent(
  'visa_types_country_fk',
  'alter table public.visa_types add constraint visa_types_country_fk foreign key (country_id) references public.countries(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_visa_types_updated_at', 'public.visa_types');

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  first_name text,
  middle_name text,
  last_name text,
  email text,
  phone text,
  country_id uuid,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.customers add column if not exists user_id uuid;
alter table public.customers add column if not exists full_name text;
alter table public.customers add column if not exists first_name text;
alter table public.customers add column if not exists middle_name text;
alter table public.customers add column if not exists last_name text;
alter table public.customers add column if not exists email text;
alter table public.customers add column if not exists phone text;
alter table public.customers add column if not exists country_id uuid;
alter table public.customers add column if not exists status text default 'active';
alter table public.customers add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.customers add column if not exists updated_at timestamptz not null default timezone('utc', now());

create unique index if not exists customers_user_id_key on public.customers (user_id) where user_id is not null;
select public.add_constraint_if_absent(
  'customers_user_fk',
  'alter table public.customers add constraint customers_user_fk foreign key (user_id) references public.users(id) on delete set null'
);
select public.add_constraint_if_absent(
  'customers_country_fk',
  'alter table public.customers add constraint customers_country_fk foreign key (country_id) references public.countries(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_customers_updated_at', 'public.customers');

do $$
begin
  if to_regclass('public.profiles') is not null then
    insert into public.customers (
      id,
      user_id,
      full_name,
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      created_at,
      updated_at
    )
    select
      id,
      user_id,
      coalesce(
        nullif(trim(coalesce(full_name, name, email, '')), ''),
        'Unknown Customer'
      ),
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      coalesce(created_at, timezone('utc', now())),
      coalesce(updated_at, created_at, timezone('utc', now()))
    from public.profiles
    on conflict (id) do update
    set
      user_id = coalesce(public.customers.user_id, excluded.user_id),
      full_name = excluded.full_name,
      first_name = coalesce(public.customers.first_name, excluded.first_name),
      middle_name = coalesce(public.customers.middle_name, excluded.middle_name),
      last_name = coalesce(public.customers.last_name, excluded.last_name),
      email = coalesce(public.customers.email, excluded.email),
      phone = coalesce(public.customers.phone, excluded.phone),
      updated_at = excluded.updated_at;
  end if;
end;
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  owner_id uuid,
  full_name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'leads_customer_fk',
  'alter table public.leads add constraint leads_customer_fk foreign key (customer_id) references public.customers(id) on delete set null'
);
select public.add_constraint_if_absent(
  'leads_owner_fk',
  'alter table public.leads add constraint leads_owner_fk foreign key (owner_id) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_leads_updated_at', 'public.leads');

create table if not exists public.visa_requirements (
  id uuid primary key default gen_random_uuid(),
  country_id uuid,
  visa_type_id uuid,
  title text not null,
  description text,
  is_required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'visa_requirements_country_fk',
  'alter table public.visa_requirements add constraint visa_requirements_country_fk foreign key (country_id) references public.countries(id) on delete cascade'
);
select public.add_constraint_if_absent(
  'visa_requirements_visa_type_fk',
  'alter table public.visa_requirements add constraint visa_requirements_visa_type_fk foreign key (visa_type_id) references public.visa_types(id) on delete cascade'
);
select public.ensure_updated_at_trigger('set_visa_requirements_updated_at', 'public.visa_requirements');

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  user_id uuid,
  profile_id uuid,
  country_id uuid,
  visa_type_id uuid,
  visa_type text,
  status text not null default 'Submitted',
  payment_status text not null default 'pending',
  reference_no text,
  travel_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.applications add column if not exists customer_id uuid;
alter table public.applications add column if not exists user_id uuid;
alter table public.applications add column if not exists profile_id uuid;
alter table public.applications add column if not exists country_id uuid;
alter table public.applications add column if not exists visa_type_id uuid;
alter table public.applications add column if not exists visa_type text;
alter table public.applications add column if not exists status text default 'Submitted';
alter table public.applications add column if not exists payment_status text default 'pending';
alter table public.applications add column if not exists reference_no text;
alter table public.applications add column if not exists travel_date date;
alter table public.applications add column if not exists notes text;
alter table public.applications add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.applications add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.applications
set customer_id = coalesce(customer_id, profile_id)
where customer_id is null
  and profile_id is not null;

update public.applications
set profile_id = coalesce(profile_id, customer_id)
where profile_id is null
  and customer_id is not null;

create unique index if not exists applications_reference_no_key
  on public.applications (reference_no)
  where reference_no is not null;

select public.add_constraint_if_absent(
  'applications_customer_fk',
  'alter table public.applications add constraint applications_customer_fk foreign key (customer_id) references public.customers(id) on delete set null'
);
select public.add_constraint_if_absent(
  'applications_user_fk',
  'alter table public.applications add constraint applications_user_fk foreign key (user_id) references public.users(id) on delete set null'
);
select public.add_constraint_if_absent(
  'applications_profile_fk',
  'alter table public.applications add constraint applications_profile_fk foreign key (profile_id) references public.customers(id) on delete set null'
);
select public.add_constraint_if_absent(
  'applications_country_fk',
  'alter table public.applications add constraint applications_country_fk foreign key (country_id) references public.countries(id) on delete set null'
);
select public.add_constraint_if_absent(
  'applications_visa_type_fk',
  'alter table public.applications add constraint applications_visa_type_fk foreign key (visa_type_id) references public.visa_types(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_applications_updated_at', 'public.applications');

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  file_url text not null,
  document_type text,
  document_name text,
  status text not null default 'pending',
  verified_by uuid,
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.documents add column if not exists application_id uuid;
alter table public.documents add column if not exists file_url text;
alter table public.documents add column if not exists document_type text;
alter table public.documents add column if not exists document_name text;
alter table public.documents add column if not exists status text default 'pending';
alter table public.documents add column if not exists verified_by uuid;
alter table public.documents add column if not exists uploaded_at timestamptz not null default timezone('utc', now());
alter table public.documents add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.documents add column if not exists updated_at timestamptz not null default timezone('utc', now());

select public.add_constraint_if_absent(
  'documents_application_fk',
  'alter table public.documents add constraint documents_application_fk foreign key (application_id) references public.applications(id) on delete cascade'
);
select public.add_constraint_if_absent(
  'documents_verified_by_fk',
  'alter table public.documents add constraint documents_verified_by_fk foreign key (verified_by) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_documents_updated_at', 'public.documents');

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'INR',
  payment_status text not null default 'pending',
  payment_method text,
  provider_ref text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.payments add column if not exists application_id uuid;
alter table public.payments add column if not exists amount numeric(12, 2) not null default 0;
alter table public.payments add column if not exists currency text not null default 'INR';
alter table public.payments add column if not exists payment_status text not null default 'pending';
alter table public.payments add column if not exists payment_method text;
alter table public.payments add column if not exists provider_ref text;
alter table public.payments add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.payments add column if not exists updated_at timestamptz not null default timezone('utc', now());

select public.add_constraint_if_absent(
  'payments_application_fk',
  'alter table public.payments add constraint payments_application_fk foreign key (application_id) references public.applications(id) on delete cascade'
);
select public.ensure_updated_at_trigger('set_payments_updated_at', 'public.payments');

do $$
begin
  if to_regclass('public.payment_detail') is not null then
    insert into public.payments (
      id,
      application_id,
      amount,
      currency,
      payment_status,
      payment_method,
      provider_ref,
      created_at,
      updated_at
    )
    select
      id,
      application_id,
      coalesce(amount, 0),
      coalesce(currency, 'INR'),
      coalesce(payment_status, 'pending'),
      payment_method,
      provider_ref,
      coalesce(created_at, timezone('utc', now())),
      coalesce(updated_at, created_at, timezone('utc', now()))
    from public.payment_detail
    on conflict (id) do nothing;
  end if;
end;
$$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  customer_id uuid,
  invoice_no text unique,
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'draft',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'invoices_application_fk',
  'alter table public.invoices add constraint invoices_application_fk foreign key (application_id) references public.applications(id) on delete set null'
);
select public.add_constraint_if_absent(
  'invoices_customer_fk',
  'alter table public.invoices add constraint invoices_customer_fk foreign key (customer_id) references public.customers(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_invoices_updated_at', 'public.invoices');

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  module text not null,
  trigger_event text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'workflows_created_by_fk',
  'alter table public.workflows add constraint workflows_created_by_fk foreign key (created_by) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_workflows_updated_at', 'public.workflows');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  workflow_id uuid,
  assigned_to uuid,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'tasks_application_fk',
  'alter table public.tasks add constraint tasks_application_fk foreign key (application_id) references public.applications(id) on delete cascade'
);
select public.add_constraint_if_absent(
  'tasks_workflow_fk',
  'alter table public.tasks add constraint tasks_workflow_fk foreign key (workflow_id) references public.workflows(id) on delete set null'
);
select public.add_constraint_if_absent(
  'tasks_assigned_to_fk',
  'alter table public.tasks add constraint tasks_assigned_to_fk foreign key (assigned_to) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_tasks_updated_at', 'public.tasks');

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  message text not null,
  type text,
  status text not null default 'unread',
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'notifications_user_fk',
  'alter table public.notifications add constraint notifications_user_fk foreign key (user_id) references public.users(id) on delete cascade'
);
select public.ensure_updated_at_trigger('set_notifications_updated_at', 'public.notifications');

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  customer_id uuid,
  sender_id uuid,
  recipient_id uuid,
  channel text,
  subject text,
  content text not null,
  status text not null default 'logged',
  sent_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'messages_application_fk',
  'alter table public.messages add constraint messages_application_fk foreign key (application_id) references public.applications(id) on delete set null'
);
select public.add_constraint_if_absent(
  'messages_customer_fk',
  'alter table public.messages add constraint messages_customer_fk foreign key (customer_id) references public.customers(id) on delete set null'
);
select public.add_constraint_if_absent(
  'messages_sender_fk',
  'alter table public.messages add constraint messages_sender_fk foreign key (sender_id) references public.users(id) on delete set null'
);
select public.add_constraint_if_absent(
  'messages_recipient_fk',
  'alter table public.messages add constraint messages_recipient_fk foreign key (recipient_id) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_messages_updated_at', 'public.messages');

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  generated_by uuid,
  name text not null,
  report_type text not null,
  parameters jsonb not null default '{}'::jsonb,
  file_url text,
  status text not null default 'queued',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'reports_generated_by_fk',
  'alter table public.reports add constraint reports_generated_by_fk foreign key (generated_by) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_reports_updated_at', 'public.reports');

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.add_constraint_if_absent(
  'audit_logs_user_fk',
  'alter table public.audit_logs add constraint audit_logs_user_fk foreign key (user_id) references public.users(id) on delete set null'
);
select public.ensure_updated_at_trigger('set_audit_logs_updated_at', 'public.audit_logs');

insert into storage.buckets (id, name, public)
values ('visa-documents', 'visa-documents', true)
on conflict (id) do nothing;
