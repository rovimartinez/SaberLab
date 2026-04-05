-- Restringir evaluaciones solo a admin
ALTER TABLE evaluaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evaluaciones_open" ON evaluaciones;

-- Solo admins pueden TODO
CREATE POLICY "evaluaciones_admin_only" ON evaluaciones FOR ALL 
    USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));
