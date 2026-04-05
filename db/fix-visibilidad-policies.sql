DROP POLICY IF EXISTS "Admin gestiona visibilidad" ON visibilidad_curso;
DROP POLICY IF EXISTS "Estudiantes leen visibilidad" ON visibilidad_curso;

CREATE POLICY "Admin gestiona visibilidad" ON visibilidad_curso FOR ALL
USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Estudiantes leen visibilidad" ON visibilidad_curso FOR SELECT
USING (auth.role() = 'authenticated');

INSERT INTO visibilidad_curso (course_id) VALUES (1), (2), (3), (4), (5), (6)
ON CONFLICT (course_id) DO NOTHING;
