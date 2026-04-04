-- =========================================================
-- Analytics views for dashboards and reporting
-- Run this AFTER db/supabase-learning-analytics.sql
-- =========================================================

create or replace view public.v_lesson_analytics_summary as
select
  s.lesson_id,
  s.course_id,
  s.module_id,
  count(*) as sessions_started,
  count(*) filter (where s.session_status = 'completed') as sessions_completed,
  count(*) filter (where s.session_status = 'abandoned') as sessions_abandoned,
  round(
    (
      count(*) filter (where s.session_status = 'completed')::numeric
      / nullif(count(*), 0)
    ) * 100,
    2
  ) as completion_rate,
  round(avg(s.total_duration_ms)::numeric, 2) as avg_session_duration_ms,
  round(avg(qa.score)::numeric, 2) as avg_quiz_score,
  count(distinct s.user_id) as active_students,
  round(avg(coalesce(mp.completed_attempts, 0))::numeric, 2) as avg_completed_missions
from public.student_learning_sessions s
left join lateral (
  select qa.score
  from public.student_quiz_attempts qa
  where qa.session_id = s.id
  order by qa.created_at desc
  limit 1
) qa on true
left join lateral (
  select count(*) filter (where ma.status = 'completed') as completed_attempts
  from public.student_mission_attempts ma
  where ma.session_id = s.id
) mp on true
group by s.lesson_id, s.course_id, s.module_id;

create or replace view public.v_module_analytics_summary as
select
  coalesce(s.module_id, 'unknown') as module_id,
  coalesce(s.course_id, split_part(s.lesson_id, '-', 1)) as course_id,
  count(*) as sessions_started,
  count(distinct s.user_id) as active_students,
  count(distinct s.lesson_id) as lessons_touched,
  round(avg(s.total_duration_ms)::numeric, 2) as avg_session_duration_ms,
  round(avg(qa.score)::numeric, 2) as avg_quiz_score,
  round(
    (
      count(*) filter (where s.session_status = 'completed')::numeric
      / nullif(count(*), 0)
    ) * 100,
    2
  ) as completion_rate
from public.student_learning_sessions s
left join public.student_quiz_attempts qa
  on qa.session_id = s.id
group by coalesce(s.module_id, 'unknown'), coalesce(s.course_id, split_part(s.lesson_id, '-', 1));

create or replace view public.v_course_analytics_summary as
select
  coalesce(s.course_id, split_part(s.lesson_id, '-', 1)) as course_id,
  count(*) as sessions_started,
  count(distinct s.user_id) as active_students,
  count(distinct s.lesson_id) as lessons_touched,
  round(avg(s.total_duration_ms)::numeric, 2) as avg_session_duration_ms,
  round(avg(qa.score)::numeric, 2) as avg_quiz_score,
  round(
    (
      count(*) filter (where s.session_status = 'completed')::numeric
      / nullif(count(*), 0)
    ) * 100,
    2
  ) as completion_rate,
  round(avg(cm.accuracy)::numeric, 2) as avg_concept_accuracy
from public.student_learning_sessions s
left join public.student_quiz_attempts qa
  on qa.session_id = s.id
left join public.student_concept_mastery cm
  on cm.user_id = s.user_id
  and coalesce(cm.course_id, split_part(s.lesson_id, '-', 1)) = coalesce(s.course_id, split_part(s.lesson_id, '-', 1))
group by coalesce(s.course_id, split_part(s.lesson_id, '-', 1));

create or replace view public.v_concept_mastery_overview as
select
  cm.user_id,
  cm.course_id,
  cm.concept,
  cm.latest_lesson_id,
  cm.attempts_count,
  cm.correct_count,
  cm.accuracy,
  cm.avg_response_time_ms,
  cm.confidence_score,
  cm.mastery_level,
  cm.first_seen_at,
  cm.last_seen_at,
  case
    when cm.mastery_level = 'automatic' then 4
    when cm.mastery_level = 'secure' then 3
    when cm.mastery_level = 'developing' then 2
    else 1
  end as mastery_rank
from public.student_concept_mastery cm;

create or replace view public.v_question_difficulty_signals as
select
  q.lesson_id,
  q.question_id,
  q.concept,
  q.objective,
  q.difficulty,
  count(*) as attempts,
  count(*) filter (where q.is_correct) as correct_attempts,
  round(
    (
      count(*) filter (where q.is_correct)::numeric
      / nullif(count(*), 0)
    ) * 100,
    2
  ) as accuracy_percent,
  round(avg(q.duration_ms)::numeric, 2) as avg_duration_ms,
  count(*) filter (where q.timed_out) as timed_out_attempts
from public.student_quiz_question_events q
group by q.lesson_id, q.question_id, q.concept, q.objective, q.difficulty;

create or replace view public.v_mission_difficulty_signals as
select
  ma.lesson_id,
  ma.mission_id,
  max(ma.mission_title) as mission_title,
  count(*) as attempts,
  count(*) filter (where ma.status = 'completed') as completed_attempts,
  count(*) filter (where ma.status = 'abandoned') as abandoned_attempts,
  round(
    (
      count(*) filter (where ma.status = 'completed')::numeric
      / nullif(count(*), 0)
    ) * 100,
    2
  ) as completion_rate,
  round(avg(ma.duration_ms)::numeric, 2) as avg_duration_ms,
  round(avg(ma.compile_errors)::numeric, 2) as avg_compile_errors
from public.student_mission_attempts ma
group by ma.lesson_id, ma.mission_id;
