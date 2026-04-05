-- Create table if not exists
CREATE TABLE IF NOT EXISTS visibilidad_curso (
    course_id INTEGER PRIMARY KEY,
    lecciones JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE visibilidad_curso ENABLE ROW LEVEL SECURITY;

-- Admin policy
DROP POLICY IF EXISTS "Admin gestiona visibilidad" ON visibilidad_curso;
CREATE POLICY "Admin gestiona visibilidad" ON visibilidad_curso FOR ALL
USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Student read policy
DROP POLICY IF EXISTS "Estudiantes leen visibilidad" ON visibilidad_curso;
CREATE POLICY "Estudiantes leen visibilidad" ON visibilidad_curso FOR SELECT
USING (auth.role() = 'authenticated');

-- Insert rows for courses
INSERT INTO visibilidad_curso (course_id) VALUES (1), (2), (3), (4), (5), (6)
ON CONFLICT (course_id) DO NOTHING;
