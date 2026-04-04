create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null default 'message',
  title text not null,
  message text not null,
  read boolean not null default false,
  time text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id bigint primary key,
  abbr text not null unique,
  slug text not null unique,
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

alter table public.courses
  add column if not exists abbr text,
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists color text,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'courses_abbr_key'
      and conrelid = 'public.courses'::regclass
  ) then
    alter table public.courses add constraint courses_abbr_key unique (abbr);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'courses_slug_key'
      and conrelid = 'public.courses'::regclass
  ) then
    alter table public.courses add constraint courses_slug_key unique (slug);
  end if;
end $$;

create table if not exists public.groups (
  id text primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  name text not null,
  teacher text,
  created_at timestamptz not null default now()
);

create table if not exists public.group_codes (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references public.groups (id) on delete cascade,
  code text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id bigint not null references public.courses (id) on delete cascade,
  group_id text references public.groups (id) on delete set null,
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'active' check (status in ('active', 'completed', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  course_id bigint not null references public.courses (id) on delete cascade,
  module_id text not null default 'general',
  evaluation_key text not null,
  title text not null,
  type text not null default 'quiz',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_date timestamptz,
  points integer not null default 100,
  grade numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.student_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  status text default 'in_progress',
  progress integer default 0 check (progress between 0 and 100),
  score numeric(5,2),
  started_at timestamptz default now(),
  completed_at timestamptz,
  last_opened_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.student_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  score numeric(5,2),
  answers jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.student_mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  mission_id integer not null,
  status text not null default 'locked' check (status in ('locked', 'available', 'in_progress', 'completed')),
  score numeric(5,2),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id, mission_id)
);

create table if not exists public.student_flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  card_id text not null,
  status text not null check (status in ('known', 'unknown')),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id, card_id)
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  overall_progress integer not null default 0 check (overall_progress between 0 and 100),
  streak_days integer not null default 0,
  total_hours numeric(8,2) not null default 0,
  lessons_completed integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  icon text,
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_access_requests_email on public.access_requests (email);
create index if not exists idx_notifications_user_id on public.notifications (user_id, read);
create index if not exists idx_group_codes_code on public.group_codes (code);
create index if not exists idx_enrollments_user_id on public.enrollments (user_id);
create index if not exists idx_evaluations_course_id on public.evaluations (course_id);
create index if not exists idx_evaluations_course_module on public.evaluations (course_id, module_id);
create index if not exists idx_evaluations_course_module_status on public.evaluations (course_id, module_id, status);
create index if not exists idx_student_lesson_progress_user_lesson on public.student_lesson_progress (user_id, lesson_id);
create index if not exists idx_student_mission_progress_user_lesson on public.student_mission_progress (user_id, lesson_id);
create index if not exists idx_student_flashcards_user_lesson on public.student_flashcards (user_id, lesson_id);
create index if not exists idx_achievements_user_id on public.achievements (user_id);

insert into public.courses (id, abbr, slug, name, color)
values
  (1, 'EE', 'electricidad-y-electronica', 'Electricidad y Electronica Basica', '#f59e0b'),
  (2, 'FP', 'fundamentos-de-programacion', 'Fundamentos de Programacion', '#3b82f6'),
  (3, 'MQ', 'quimica-tecnologica', 'Mediaciones Tecnologicas en la Quimica', '#10b981'),
  (4, 'MA', 'modelado-y-animacion-3d', 'Modelado y Animacion 3D', '#ec4899'),
  (5, 'RE', 'robotica-educativa', 'Robotica Educativa', '#a855f7'),
  (6, 'TD', 'tendencias-tecnologicas', 'Tendencias y Desarrollo en Tecnologia', '#f97316')
on conflict (id) do update
set
  abbr = excluded.abbr,
  slug = excluded.slug,
  name = excluded.name,
  color = excluded.color;

alter table public.profiles enable row level security;
alter table public.access_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.courses enable row level security;
alter table public.groups enable row level security;
alter table public.group_codes enable row level security;
alter table public.enrollments enable row level security;
alter table public.evaluations enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.student_quiz_attempts enable row level security;
alter table public.student_mission_progress enable row level security;
alter table public.student_flashcards enable row level security;
alter table public.user_progress enable row level security;
alter table public.achievements enable row level security;

drop policy if exists "profiles select own or admin" on public.profiles;
create policy "profiles select own or admin"
on public.profiles for select
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "profiles insert own or admin" on public.profiles;
create policy "profiles insert own or admin"
on public.profiles for insert
with check (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin"
on public.profiles for update
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "access requests insert public" on public.access_requests;
create policy "access requests insert public"
on public.access_requests for insert
with check (true);

drop policy if exists "access requests select admin" on public.access_requests;
create policy "access requests select admin"
on public.access_requests for select
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "access requests update admin" on public.access_requests;
create policy "access requests update admin"
on public.access_requests for update
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "notifications own rows" on public.notifications;
create policy "notifications own rows"
on public.notifications for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "courses readable by authenticated" on public.courses;
create policy "courses readable by authenticated"
on public.courses for select
using (auth.role() = 'authenticated');

drop policy if exists "courses admin manage" on public.courses;
create policy "courses admin manage"
on public.courses for all
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "groups readable by authenticated" on public.groups;
create policy "groups readable by authenticated"
on public.groups for select
using (auth.role() = 'authenticated');

drop policy if exists "groups admin manage" on public.groups;
create policy "groups admin manage"
on public.groups for all
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "group codes readable by authenticated" on public.group_codes;
create policy "group codes readable by authenticated"
on public.group_codes for select
using (auth.role() = 'authenticated');

drop policy if exists "group codes admin manage" on public.group_codes;
create policy "group codes admin manage"
on public.group_codes for all
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "enrollments own rows" on public.enrollments;
create policy "enrollments own rows"
on public.enrollments for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "evaluations readable by authenticated" on public.evaluations;
create policy "evaluations readable by authenticated"
on public.evaluations for select
using (auth.role() = 'authenticated');

drop policy if exists "evaluations admin manage" on public.evaluations;
create policy "evaluations admin manage"
on public.evaluations for all
using (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "student profiles own rows" on public.student_profiles;
create policy "student profiles own rows"
on public.student_profiles for all
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "lesson progress own rows" on public.student_lesson_progress;
create policy "lesson progress own rows"
on public.student_lesson_progress for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "quiz attempts own rows" on public.student_quiz_attempts;
create policy "quiz attempts own rows"
on public.student_quiz_attempts for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "mission progress own rows" on public.student_mission_progress;
create policy "mission progress own rows"
on public.student_mission_progress for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "flashcards own rows" on public.student_flashcards;
create policy "flashcards own rows"
on public.student_flashcards for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "user progress own rows" on public.user_progress;
create policy "user progress own rows"
on public.user_progress for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "achievements own rows" on public.achievements;
create policy "achievements own rows"
on public.achievements for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));
