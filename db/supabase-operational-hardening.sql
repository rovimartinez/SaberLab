-- =========================================================
-- Operational hardening migration
-- Safe additive improvements for operational tables
-- Run this AFTER db/supabase-setup.sql
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_access_requests_set_updated_at on public.access_requests;
create trigger trg_access_requests_set_updated_at
before update on public.access_requests
for each row
execute function public.set_updated_at();

drop trigger if exists trg_enrollments_set_updated_at on public.enrollments;
create trigger trg_enrollments_set_updated_at
before update on public.enrollments
for each row
execute function public.set_updated_at();

drop trigger if exists trg_student_profiles_set_updated_at on public.student_profiles;
create trigger trg_student_profiles_set_updated_at
before update on public.student_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_student_lesson_progress_set_updated_at on public.student_lesson_progress;
create trigger trg_student_lesson_progress_set_updated_at
before update on public.student_lesson_progress
for each row
execute function public.set_updated_at();

drop trigger if exists trg_student_mission_progress_set_updated_at on public.student_mission_progress;
create trigger trg_student_mission_progress_set_updated_at
before update on public.student_mission_progress
for each row
execute function public.set_updated_at();

drop trigger if exists trg_student_flashcards_set_updated_at on public.student_flashcards;
create trigger trg_student_flashcards_set_updated_at
before update on public.student_flashcards
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_progress_set_updated_at on public.user_progress;
create trigger trg_user_progress_set_updated_at
before update on public.user_progress
for each row
execute function public.set_updated_at();

create index if not exists idx_access_requests_status_created
  on public.access_requests (status, created_at desc);

create index if not exists idx_group_codes_group_expires
  on public.group_codes (group_id, expires_at desc);

create index if not exists idx_enrollments_course_status
  on public.enrollments (course_id, status);

create index if not exists idx_enrollments_group_id
  on public.enrollments (group_id);

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_evaluations_status_due_date
  on public.evaluations (status, due_date asc);

create index if not exists idx_student_lesson_progress_user_last_opened
  on public.student_lesson_progress (user_id, last_opened_at desc);

create index if not exists idx_student_lesson_progress_lesson_status
  on public.student_lesson_progress (lesson_id, status);

create index if not exists idx_student_mission_progress_user_status
  on public.student_mission_progress (user_id, status, updated_at desc);

create index if not exists idx_student_flashcards_user_status
  on public.student_flashcards (user_id, status, updated_at desc);
