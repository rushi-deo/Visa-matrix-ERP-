do $$
begin
  if to_regclass('public.visa_type') is not null then
    execute 'alter table public.visa_type enable row level security';
    execute 'grant select on table public.visa_type to anon, authenticated';

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'visa_type'
        and policyname = 'visa_type_select_policy'
    ) then
      execute 'create policy visa_type_select_policy on public.visa_type for select to anon, authenticated using (true)';
    end if;
  end if;

  if to_regclass('public.requirements') is not null then
    execute 'alter table public.requirements enable row level security';
    execute 'grant select on table public.requirements to anon, authenticated';

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'requirements'
        and policyname = 'requirements_select_policy'
    ) then
      execute 'create policy requirements_select_policy on public.requirements for select to anon, authenticated using (true)';
    end if;
  end if;
end $$;
