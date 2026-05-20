create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on update cascade on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.users(id) on update cascade on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on update cascade on delete cascade,
  event_type text not null,
  actor_id uuid references public.users(id) on update cascade on delete set null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on update cascade on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  ip_address inet,
  user_agent text,
  before jsonb,
  after jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.applications
  add column if not exists status text not null default 'draft';

alter table public.applications
  add column if not exists application_status text not null default 'draft';

update public.applications
set status = case lower(coalesce(status, application_status, 'draft'))
  when 'created' then 'draft'
  when 'submitted' then 'submitted'
  when 'processing' then 'embassy_processing'
  when 'approved' then 'approved'
  when 'rejected' then 'rejected'
  when 'documents_pending' then 'documents_pending'
  when 'payment_pending' then 'payment_pending'
  when 'payment_confirmed' then 'payment_confirmed'
  else 'draft'
end
where status is null
   or lower(status) not in (
      'draft',
      'submitted',
      'payment_pending',
      'payment_confirmed',
      'documents_pending',
      'documents_uploaded',
      'document_review',
      'additional_docs_required',
      'ready_for_submission',
      'submitted_to_embassy',
      'embassy_processing',
      'approved',
      'rejected',
      'withdrawn',
      'closed'
   )
   or status <> lower(status);

update public.applications
set application_status = status
where application_status is null
   or application_status <> status;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_status_standard_check'
  ) then
    alter table public.applications
      add constraint applications_status_standard_check
      check (
        status in (
          'draft',
          'submitted',
          'payment_pending',
          'payment_confirmed',
          'documents_pending',
          'documents_uploaded',
          'document_review',
          'additional_docs_required',
          'ready_for_submission',
          'submitted_to_embassy',
          'embassy_processing',
          'approved',
          'rejected',
          'withdrawn',
          'closed'
        )
      );
  end if;
end $$;

create index if not exists application_status_history_application_created_idx
  on public.application_status_history (application_id, created_at desc);

create index if not exists application_events_application_created_idx
  on public.application_events (application_id, created_at desc);

create index if not exists application_events_type_created_idx
  on public.application_events (event_type, created_at desc);

create index if not exists audit_logs_entity_created_idx
  on public.audit_logs (entity_type, entity_id, created_at desc);

create index if not exists audit_logs_actor_created_idx
  on public.audit_logs (actor_id, created_at desc);

create index if not exists applications_country_visa_idx
  on public.applications (country_id, visa_type_id);

create index if not exists applications_status_created_idx
  on public.applications (status, created_at desc);

create index if not exists documents_application_status_idx
  on public.documents (application_id, status);

create index if not exists payments_application_status_idx
  on public.payments (application_id, payment_status);

create index if not exists tasks_assignee_status_due_idx
  on public.tasks (assigned_to, status, due_date);

create index if not exists visa_types_country_id_idx
  on public.visa_types (country_id);

create index if not exists visa_requirements_country_visa_idx
  on public.visa_requirements (country_id, visa_type_id);

alter table public.application_status_history enable row level security;
alter table public.application_events enable row level security;
alter table public.audit_logs enable row level security;

grant select, insert on table public.application_status_history to authenticated;
grant select, insert on table public.application_events to authenticated;
grant insert on table public.audit_logs to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'application_status_history'
      and policyname = 'application_status_history_authenticated_read'
  ) then
    create policy application_status_history_authenticated_read
      on public.application_status_history
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'application_events'
      and policyname = 'application_events_authenticated_read'
  ) then
    create policy application_events_authenticated_read
      on public.application_events
      for select
      to authenticated
      using (true);
  end if;
end $$;
