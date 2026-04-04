insert into public.evaluations (course_id, module_id, evaluation_key, title, type, status, points)
select
  5,
  'm1',
  're-m1-e1',
  'Evaluacion formal del modulo 1',
  'quiz',
  'pending',
  60
where not exists (
  select 1
  from public.evaluations
  where course_id = 5
    and module_id = 'm1'
    and evaluation_key = 're-m1-e1'
);
