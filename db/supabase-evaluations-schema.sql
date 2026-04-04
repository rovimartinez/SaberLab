-- =========================================================
-- Evaluations scaling migration
-- Add stable identifiers for courses with many evaluations
-- Run this on existing projects after db/supabase-setup.sql
-- =========================================================

alter table public.evaluations
  add column if not exists module_id text,
  add column if not exists evaluation_key text,
  add column if not exists updated_at timestamptz not null default now();

update public.evaluations
set module_id = case
  when lower(title) like '%modulo 1%' then 'm1'
  when lower(title) like '%modulo 2%' then 'm2'
  when lower(title) like '%modulo 3%' then 'm3'
  when lower(title) like '%modulo 4%' then 'm4'
  else 'general'
end
where module_id is null;

update public.evaluations
set evaluation_key = case
  when course_id = 5 and lower(title) = lower('Evaluacion formal del modulo 1') then 're-m1-e1'
  else concat('eval-', substr(id::text, 1, 8))
end
where evaluation_key is null;

alter table public.evaluations
  alter column module_id set default 'general',
  alter column module_id set not null,
  alter column evaluation_key set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'evaluations_course_module_key_key'
      and conrelid = 'public.evaluations'::regclass
  ) then
    alter table public.evaluations
      add constraint evaluations_course_module_key_key
      unique (course_id, module_id, evaluation_key);
  end if;
end $$;

create index if not exists idx_evaluations_course_module
  on public.evaluations (course_id, module_id);

create index if not exists idx_evaluations_course_module_status
  on public.evaluations (course_id, module_id, status);
