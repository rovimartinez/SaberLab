-- Política más permisiva para testing
ALTER TABLE evaluaciones DISABLE ROW LEVEL SECURITY;

-- Habilitar con política abierta para testing
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede hacer TODO (temporal para testing)
DROP POLICY IF EXISTS "evaluaciones_open" ON evaluaciones;
CREATE POLICY "evaluaciones_open" ON evaluaciones FOR ALL USING (auth.role() = 'authenticated');
