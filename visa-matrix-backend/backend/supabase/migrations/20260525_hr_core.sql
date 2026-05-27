-- HR Core System schema
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  head_id uuid null,
  organization_id uuid null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.ensure_updated_at_trigger('set_departments_updated_at', 'public.departments');

create table if not exists public.designations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department_id uuid null,
  level integer default 0,
  organization_id uuid null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.ensure_updated_at_trigger('set_designations_updated_at', 'public.designations');

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text unique,
  full_name text not null,
  email text unique,
  phone text,
  department_id uuid null,
  designation_id uuid null,
  status text not null default 'active',
  date_of_joining date null,
  manager_id uuid null,
  emergency_contact jsonb null,
  profile_image text null,
  organization_id uuid null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

select public.ensure_updated_at_trigger('set_employees_updated_at', 'public.employees');

-- Foreign keys
select public.add_constraint_if_absent(
  'departments_head_fk',
  'alter table public.departments add constraint departments_head_fk foreign key (head_id) references public.employees(id) on update cascade on delete set null'
);

select public.add_constraint_if_absent(
  'designations_department_fk',
  'alter table public.designations add constraint designations_department_fk foreign key (department_id) references public.departments(id) on update cascade on delete set null'
);

select public.add_constraint_if_absent(
  'employees_department_fk',
  'alter table public.employees add constraint employees_department_fk foreign key (department_id) references public.departments(id) on update cascade on delete set null'
);

select public.add_constraint_if_absent(
  'employees_designation_fk',
  'alter table public.employees add constraint employees_designation_fk foreign key (designation_id) references public.designations(id) on update cascade on delete set null'
);

select public.add_constraint_if_absent(
  'employees_manager_fk',
  'alter table public.employees add constraint employees_manager_fk foreign key (manager_id) references public.employees(id) on update cascade on delete set null'
);

-- Indexes to support queries
create index if not exists idx_employees_organization on public.employees (organization_id);
create index if not exists idx_employees_department on public.employees (department_id);
create index if not exists idx_employees_manager on public.employees (manager_id);
create index if not exists idx_departments_organization on public.departments (organization_id);
create index if not exists idx_designations_department on public.designations (department_id);
