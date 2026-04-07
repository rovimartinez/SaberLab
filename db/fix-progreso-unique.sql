-- Agregar restricción de unicidad a progreso_usuario para permitir upsert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'progreso_usuario_user_id_lesson_id_key'
    ) THEN
        ALTER TABLE progreso_usuario ADD CONSTRAINT progreso_usuario_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
    END IF;
END $$;
