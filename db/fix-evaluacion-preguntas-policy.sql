-- Arreglar políticas de evaluacion_preguntas
DROP POLICY IF EXISTS "preguntas_open" ON evaluacion_preguntas;
DROP POLICY IF EXISTS "evaluacion_preguntas_admin" ON evaluacion_preguntas;
DROP POLICY IF EXISTS "Admin gestiona preguntas" ON evaluacion_preguntas;
DROP POLICY IF EXISTS "Estudiantes ven preguntas" ON evaluacion_preguntas;

ALTER TABLE evaluacion_preguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluacion_preguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preguntas_open" ON evaluacion_preguntas FOR ALL USING (auth.role() = 'authenticated');
