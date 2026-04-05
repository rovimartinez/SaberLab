-- Agregar columnas faltantes a evaluaciones
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS grade INTEGER;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100;

-- Insertar evaluaciones de ejemplo para cada curso (id 1-6)
-- Curso 1: Electricidad Básica (EE)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, due_date, status, max_score, points) VALUES
(1, 'm1', 'ee-m1-eval', 'Evaluación Módulo 1: Conceptos de Electricidad', 'quiz', '2026-04-15', 'pending', 100, 100),
(1, 'm2', 'ee-m2-eval', 'Evaluación Módulo 2: Componentes Electrónicos', 'quiz', '2026-04-22', 'pending', 100, 100),
(1, 'm3', 'ee-m3-eval', 'Evaluación Módulo 3: Circuitos', 'quiz', '2026-04-29', 'pending', 100, 100);

-- Curso 2: Fundamentos de Programación (FP)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, due_date, status, max_score, points) VALUES
(2, 'm1', 'fp-m1-eval', 'Evaluación Módulo 1: Fundamentos de Programación', 'quiz', '2026-04-15', 'pending', 100, 100),
(2, 'm2', 'fp-m2-eval', 'Evaluación Módulo 2: Control de Flujo', 'quiz', '2026-04-22', 'pending', 100, 100),
(2, 'm3', 'fp-m3-eval', 'Evaluación Módulo 3: Funciones y Estructuras', 'quiz', '2026-04-29', 'pending', 100, 100);

-- Curso 3: Química (MQ)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, due_date, status, max_score, points) VALUES
(3, 'm1', 'mq-m1-eval', 'Evaluación Módulo 1: Estructura Atómica', 'quiz', '2026-04-15', 'pending', 100, 100),
(3, 'm2', 'mq-m2-eval', 'Evaluación Módulo 2: Reacciones Químicas', 'quiz', '2026-04-22', 'pending', 100, 100);

-- Curso 4: Modelado 3D (MA)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, due_date, status, max_score, points) VALUES
(4, 'm1', 'ma-m1-eval', 'Evaluación Módulo 1: Introducción al 3D', 'quiz', '2026-04-15', 'pending', 100, 100),
(4, 'm2', 'ma-m2-eval', 'Evaluación Módulo 2: Texturizado', 'quiz', '2026-04-22', 'pending', 100, 100),
(4, 'm3', 'ma-m3-eval', 'Evaluación Módulo 3: Animación', 'quiz', '2026-04-29', 'pending', 100, 100);

-- Curso 5: Robótica (RE)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, due_date, status, max_score, points) VALUES
(5, 'm1', 're-m1-eval', 'Evaluación Módulo 1: Introducción a Arduino', 'quiz', '2026-04-15', 'pending', 100, 100),
(5, 'm2', 're-m2-eval', 'Evaluación Módulo 2: Sensores', 'quiz', '2026-04-22', 'pending', 100, 100),
(5, 'm3', 're-m3-eval', 'Evaluación Módulo 3: Actuadores', 'quiz', '2026-04-29', 'pending', 100, 100),
(5, 'm4', 're-m4-eval', 'Evaluación Módulo 4: Proyecto Integrador', 'quiz', '2026-05-06', 'pending', 100, 100);

-- Curso 6: Tecnologías Digitales (TD)
INSERT INTO evaluaciones (course_id, module_id, evaluation_key, title, type, due_date, status, max_score, points) VALUES
(6, 'm1', 'td-m1-eval', 'Evaluación Módulo 1: IA y Blockchain', 'quiz', '2026-04-15', 'pending', 100, 100),
(6, 'm2', 'td-m2-eval', 'Evaluación Módulo 2: IoT y Ciberseguridad', 'quiz', '2026-04-22', 'pending', 100, 100);
