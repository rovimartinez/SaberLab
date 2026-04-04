-- =========================================================
-- Evaluation proctoring schema
-- Track focus changes, fullscreen exits and suspicious actions
-- Run this AFTER db/supabase-setup.sql
-- =========================================================

create table if not exists public.student_evaluation_proctoring_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.student_learning_sessions (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  evaluation_key text not null,
  lesson_id text not null,
  event_type text not null check (
    event_type in (
      'exam_started',
      'fullscreen_enter',
      'fullscreen_exit',
      'window_blur',
      'window_focus',
      'visibility_hidden',
      'visibility_visible',
      'copy_attempt',
      'paste_attempt',
      'context_menu',
      'warning_issued',
      'locked',
      'submitted'
    )
  ),
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  warning_count integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_eval_proctoring_user_eval_time
  on public.student_evaluation_proctoring_events (user_id, evaluation_key, created_at desc);

create index if not exists idx_eval_proctoring_session
  on public.student_evaluation_proctoring_events (session_id, created_at desc);

alter table public.student_evaluation_proctoring_events enable row level security;

drop policy if exists "evaluation proctoring own rows" on public.student_evaluation_proctoring_events;
create policy "evaluation proctoring own rows"
on public.student_evaluation_proctoring_events for all
using (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (auth.uid() = user_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));
