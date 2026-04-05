-- Evaluaciones para el Módulo 1 de Robótica Educativa (RE)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, max_score, due_date, created_at) VALUES 
(3, 're-m1', 're-m1-ev1', 'Evaluación Módulo 1: Fundamentos y Lógica Digital', 'quiz', 100, '2026-04-30', now()),
(3, 're-m1', 're-m1-ev2', 'Proyecto Práctico: Mi Primer Robot', 'project', 150, '2026-05-15', now()),
(3, 're-m2', 're-m2-ev1', 'Evaluación Módulo 2: Potencia y Movimiento', 'quiz', 100, '2026-05-30', now()),
(3, 're-m3', 're-m3-ev1', 'Evaluación Módulo 3: Sensores y Percepción', 'quiz', 100, '2026-06-15', now()),
(3, 're-m4', 're-m4-ev1', 'Proyecto Integrador Final', 'project', 200, '2026-06-30', now())
ON CONFLICT DO NOTHING;
