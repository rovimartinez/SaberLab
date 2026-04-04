-- =========================================================
-- Dashboard starter queries
-- Run after db/supabase-learning-analytics.sql
-- If available, also run db/supabase-analytics-views.sql first
-- =========================================================

-- 1. Hardest concepts in a course
select
  course_id,
  concept,
  count(*) as students_seen,
  round(avg(accuracy)::numeric, 2) as avg_accuracy,
  round(avg(avg_response_time_ms)::numeric, 2) as avg_response_time_ms
from public.student_concept_mastery
where course_id = 'RE'
group by course_id, concept
order by avg_accuracy asc, avg_response_time_ms desc
limit 20;

-- 2. Lessons with highest abandonment
select
  lesson_id,
  course_id,
  module_id,
  sessions_started,
  sessions_abandoned,
  completion_rate
from public.v_lesson_analytics_summary
order by sessions_abandoned desc, completion_rate asc
limit 20;

-- 3. Slow questions even when students answer correctly
select
  lesson_id,
  question_id,
  concept,
  objective,
  attempts,
  accuracy_percent,
  avg_duration_ms
from public.v_question_difficulty_signals
where accuracy_percent >= 70
order by avg_duration_ms desc
limit 20;

-- 4. Questions that are both hard and slow
select
  lesson_id,
  question_id,
  concept,
  difficulty,
  attempts,
  accuracy_percent,
  avg_duration_ms,
  timed_out_attempts
from public.v_question_difficulty_signals
where attempts >= 3
order by accuracy_percent asc, avg_duration_ms desc
limit 20;

-- 5. Missions with most friction
select
  lesson_id,
  mission_id,
  mission_title,
  attempts,
  completed_attempts,
  abandoned_attempts,
  completion_rate,
  avg_duration_ms,
  avg_compile_errors
from public.v_mission_difficulty_signals
order by completion_rate asc, avg_compile_errors desc, avg_duration_ms desc
limit 20;

-- 6. Flashcards still mostly unknown
select
  lesson_id,
  card_id,
  count(*) filter (where event_type = 'mark_known') as marked_known,
  count(*) filter (where event_type = 'mark_unknown') as marked_unknown,
  round(avg(response_time_ms)::numeric, 2) as avg_response_time_ms
from public.student_flashcard_events
group by lesson_id, card_id
having count(*) filter (where event_type = 'mark_unknown') > count(*) filter (where event_type = 'mark_known')
order by marked_unknown desc, avg_response_time_ms desc nulls last
limit 20;

-- 7. Module-level health summary
select
  module_id,
  course_id,
  active_students,
  lessons_touched,
  completion_rate,
  avg_quiz_score,
  avg_session_duration_ms
from public.v_module_analytics_summary
order by completion_rate asc, avg_quiz_score asc;

-- 8. Course-level health summary
select
  course_id,
  active_students,
  lessons_touched,
  sessions_started,
  completion_rate,
  avg_quiz_score,
  avg_concept_accuracy
from public.v_course_analytics_summary
order by avg_concept_accuracy asc, completion_rate asc;

-- 9. Mastery distribution by course
select
  course_id,
  mastery_level,
  count(*) as concept_rows
from public.student_concept_mastery
group by course_id, mastery_level
order by course_id, mastery_level;

-- 10. Retention follow-up: concepts seen long ago but still weak
select
  course_id,
  concept,
  mastery_level,
  accuracy,
  last_seen_at
from public.student_concept_mastery
where mastery_level in ('emerging', 'developing')
order by last_seen_at asc, accuracy asc
limit 20;
