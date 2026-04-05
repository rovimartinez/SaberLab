-- Policias RLS para solicitudes_acceso (para que admin pueda ver todas)

-- Eliminar política restrictiva si existe
DROP POLICY IF EXISTS "Solicitudes pueden ser leídas" ON solicitudes_acceso;

-- Crear política que permite al admin ver todas las solicitudes
CREATE POLICY "Admin ve todas solicitudes" ON solicitudes_acceso FOR SELECT 
USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE role = 'admin')
);

-- Para usuarios normales, solo ver las propias
CREATE POLICY "Usuario ve sus solicitudes" ON solicitudes_acceso FOR SELECT 
USING (
    auth.uid() IN (SELECT id FROM perfiles WHERE email = solicitudes_acceso.email)
);
