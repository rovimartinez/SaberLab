-- IMPORTAR DESDE CSV (ejecutar en Supabase SQL Editor)
-- Primero, crear tabla temporal para importar
CREATE TEMP TABLE temp_preguntas (
    question_text TEXT,
    question_type TEXT,
    option_1 TEXT,
    option_2 TEXT,
    option_3 TEXT,
    option_4 TEXT,
    correct_answer TEXT,
    points INTEGER,
    concept TEXT,
    objective TEXT,
    difficulty TEXT,
    order_index INTEGER
);

-- Luego pegar los datos del CSV aquí y ejecutar:
-- COPY temp_preguntas FROM stdin WITH (FORMAT csv, HEADER true);
-- Después insertar a evaluacion_preguntas:
-- INSERT INTO evaluacion_preguntas (evaluacion_id, question_text, question_type, options, correct_answer, points, concept, objective, difficulty, order_index)
-- SELECT 'ID-DE-LA-EVALUACION', question_text, question_type, 
--        json_build_array(option_1, option_2, option_3, option_4)::jsonb, 
--        correct_answer, points, concept, objective, difficulty, order_index
-- FROM temp_preguntas;
