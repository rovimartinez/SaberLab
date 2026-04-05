-- Arreglar políticas de evaluaciones para usar email en lugar de auth.uid()
-- Esto evita problemas cuando el perfil tiene id diferente al auth.uid()

-- Primero quitar RLS temporalmente
ALTER TABLE evaluaciones DISABLE ROW LEVEL SECURITY;

-- Luego volver a habilitar con políticas correctas
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer evaluaciones
DROP POLICY IF EXISTS "Evaluaciones pueden ser leídas" ON evaluaciones;
DROP POLICY IF EXISTS "evaluaciones_read" ON evaluaciones;
CREATE POLICY "evaluaciones_read" ON evaluaciones FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins pueden hacer INSERT, UPDATE, DELETE (usando email)
DROP POLICY IF EXISTS "Evaluaciones admin" ON evaluaciones;
DROP POLICY IF EXISTS "evaluaciones_admin_all" ON evaluaciones;
CREATE POLICY "evaluaciones_admin_all" ON evaluaciones FOR ALL
    USING (EXISTS (SELECT 1 FROM perfiles WHERE email = (auth.jwt() ->> 'email') AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE email = (auth.jwt() ->> 'email') AND role = 'admin'));