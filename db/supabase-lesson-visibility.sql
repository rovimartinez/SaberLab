-- Tabla para persistir configuración de visibilidad de lecciones por curso
CREATE TABLE IF NOT EXISTS course_lesson_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    visible BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, lesson_id)
);

-- Habilitar RLS
ALTER TABLE course_lesson_visibility ENABLE ROW LEVEL SECURITY;

-- Política: admins pueden ver y editar todo
CREATE POLICY "Admins can manage lesson visibility"
ON course_lesson_visibility FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Política: usuarios autenticados pueden leer (para que estudiantes carguen config)
CREATE POLICY "Authenticated users can read visibility"
ON course_lesson_visibility FOR SELECT
USING (auth.role() = 'authenticated');

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_lesson_visibility_course
ON course_lesson_visibility(course_id);
