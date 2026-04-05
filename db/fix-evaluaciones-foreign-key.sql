-- =====================================================
-- ARREGLAR RELACIÓN ENTRE EVALUACIONES Y CURSOS
-- Agregar foreign key constraint faltante
-- =====================================================

-- Agregar foreign key constraint si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'evaluaciones_course_id_fkey'
          AND conrelid = 'public.evaluaciones'::regclass
    ) THEN
        ALTER TABLE evaluaciones
        ADD CONSTRAINT evaluaciones_course_id_fkey
        FOREIGN KEY (course_id) REFERENCES cursos(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verificar que la constraint existe
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'evaluaciones';