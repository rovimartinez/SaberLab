-- =========================================================
-- Learning analytics schema extension
-- Additive migration for neuroscience-oriented analytics
-- Run this AFTER db/supabase-setup.sql
-- =========================================================

alter table public.student_quiz_attempts
  add column if not exists session_id uuid,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists duration_ms integer,
  add column if not exists analytics_version integer not null default 1,
  add column if not exists attempt_number integer,
  add column if not exists lesson_version text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_student_quiz_attempts_user_lesson_created
  on public.student_quiz_attempts (user_id, lesson_id, created_at desc);

create index if not exists idx_student_quiz_attempts_session
  on public.student_quiz_attempts (session_id);

create index if not exists idx_student_quiz_attempts_answers_gin
  on public.student_quiz_attempts using gin (answers);

create table if not exists public.student_learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  course_id text,
  module_id text,
  source text default 'web',
  session_status text not null default 'active' check (session_status in ('active', 'completed', 'abandoned', 'timeout')),
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  ended_at timestamptz,
  total_duration_ms integer,
  active_duration_ms integer,
  idle_duration_ms integer,
  max_scroll_depth numeric(5,2),
  entry_path text,
  exit_path text,
  device_info jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_learning_sessions_user_started
  on public.student_learning_sessions (user_id, started_at desc);

create index if not exists idx_learning_sessions_lesson
  on public.student_learning_sessions (lesson_id, started_at desc);

create table if not exists public.student_content_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.student_learning_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  block_id text,
  section_id text,
  event_type text not null check (
    event_type in (
      'content_view',
      'section_view',
      'scroll_depth',
      'focus',
      'blur',
      'review_open',
      'review_close',
      'summary_open',
      'summary_close',
      'challenge_view',
      'challenge_simulate',
      'tab_change'
    )
  ),
  dwell_time_ms integer,
  progress_percent numeric(5,2),
  event_value numeric(10,2),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_events_user_lesson_time
  on public.student_content_events (user_id, lesson_id, created_at desc);

create index if not exists idx_content_events_session
  on public.student_content_events (session_id, created_at);

create index if not exists idx_content_events_type
  on public.student_content_events (event_type, created_at desc);

create table if not exists public.student_quiz_question_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.student_quiz_attempts (id) on delete cascade,
  session_id uuid references public.student_learning_sessions (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  question_id text not null,
  question_index integer not null,
  concept text,
  objective text,
  difficulty text,
  selected_option_index integer,
  selected_option_label text,
  correct_option_index integer,
  correct_option_label text,
  is_correct boolean not null default false,
  timed_out boolean not null default false,
  duration_ms integer,
  remaining_seconds integer,
  started_at timestamptz,
  answered_at timestamptz,
  confidence numeric(5,2),
  cognitive_state text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_question_events_attempt
  on public.student_quiz_question_events (attempt_id, question_index);

create index if not exists idx_quiz_question_events_user_concept
  on public.student_quiz_question_events (user_id, concept, created_at desc);

create index if not exists idx_quiz_question_events_lesson_question
  on public.student_quiz_question_events (lesson_id, question_id, created_at desc);

create table if not exists public.student_flashcard_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.student_learning_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  card_id text not null,
  section_id text,
  event_type text not null check (
    event_type in (
      'flip',
      'mark_known',
      'mark_unknown',
      'summary_open',
      'summary_close'
    )
  ),
  response_time_ms integer,
  confidence numeric(5,2),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_flashcard_events_user_lesson
  on public.student_flashcard_events (user_id, lesson_id, created_at desc);

create index if not exists idx_flashcard_events_card
  on public.student_flashcard_events (lesson_id, card_id, created_at desc);

create table if not exists public.student_mission_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.student_learning_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  mission_id integer not null,
  mission_title text,
  attempt_number integer,
  status text not null default 'started' check (status in ('started', 'submitted', 'completed', 'abandoned')),
  score numeric(5,2),
  duration_ms integer,
  compile_errors integer,
  hint_used boolean not null default false,
  code_snapshot text,
  feedback jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_mission_attempts_user_lesson
  on public.student_mission_attempts (user_id, lesson_id, created_at desc);

create index if not exists idx_mission_attempts_lesson_mission
  on public.student_mission_attempts (lesson_id, mission_id, created_at desc);

create table if not exists public.student_concept_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  concept text not null,
  course_id text,
  latest_lesson_id text,
  attempts_count integer not null default 0,
  correct_count integer not null default 0,
  accuracy numeric(5,2) not null default 0,
  avg_response_time_ms numeric(10,2),
  confidence_score numeric(5,2),
  mastery_level text not null default 'emerging' check (mastery_level in ('emerging', 'developing', 'secure', 'automatic')),
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, concept)
);

create index if not exists idx_concept_mastery_user_course
  on public.student_concept_mastery (user_id, course_id);

create index if not exists idx_concept_mastery_concept_level
  on public.student_concept_mastery (concept, mastery_level);

create or replace view public.v_student_concept_signals as
select
  q.user_id,
  q.lesson_id,
  q.concept,
  count(*) as question_events,
  count(*) filter (where q.is_correct) as correct_events,
  round(
    (count(*) filter (where q.is_correct)::numeric / nullif(count(*), 0)) * 100,
    2
  ) as accuracy_percent,
  round(avg(q.duration_ms)::numeric, 2) as avg_duration_ms,
  count(*) filter (where q.timed_out) as timed_out_events,
  min(q.created_at) as first_seen_at,
  max(q.created_at) as last_seen_at
from public.student_quiz_question_events q
where q.concept is not null
group by q.user_id, q.lesson_id, q.concept;

alter table public.student_learning_sessions enable row level security;
alter table public.student_content_events enable row level security;
alter table public.student_quiz_question_events enable row level security;
alter table public.student_flashcard_events enable row level security;
alter table public.student_mission_attempts enable row level security;
alter table public.student_concept_mastery enable row level security;

drop policy if exists "learning sessions own rows" on public.student_learning_sessions;
create policy "learning sessions own rows"
on public.student_learning_sessions for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "content events own rows" on public.student_content_events;
create policy "content events own rows"
on public.student_content_events for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "quiz question events own rows" on public.student_quiz_question_events;
create policy "quiz question events own rows"
on public.student_quiz_question_events for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "flashcard events own rows" on public.student_flashcard_events;
create policy "flashcard events own rows"
on public.student_flashcard_events for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "mission attempts own rows" on public.student_mission_attempts;
create policy "mission attempts own rows"
on public.student_mission_attempts for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "concept mastery own rows" on public.student_concept_mastery;
create policy "concept mastery own rows"
on public.student_concept_mastery for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));
