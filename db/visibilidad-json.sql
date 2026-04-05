-- Tabla simple de visibilidad: una fila por curso con JSON
CREATE TABLE visibilidad_curso (
    course_id INTEGER PRIMARY KEY,
    lecciones JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE visibilidad_curso ENABLE ROW LEVEL SECURITY;

-- Policy admin
CREATE POLICY "Admin gestiona visibilidad" ON visibilidad_curso FOR ALL
USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Policy estudiantes pueden leer
CREATE POLICY "Estudiantes leen visibilidad" ON visibilidad_curso FOR SELECT
USING (auth.role() = 'authenticated');

-- Insertar filas para cursos existentes (1-6)
INSERT INTO visibilidad_curso (course_id) VALUES (1), (2), (3), (4), (5), (6)
ON CONFLICT (course_id) DO NOTHING;
