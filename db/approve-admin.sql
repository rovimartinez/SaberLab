-- Aprobar solicitud y crear perfil admin para rovimartinez@gmail.com

-- 1. Cambiar status de solicitud
UPDATE solicitudes_acceso 
SET status = 'approved' 
WHERE email = 'rovimartinez@gmail.com';

-- 2. Actualizar perfil con rol admin y nombre completo
UPDATE perfiles 
SET role = 'admin', full_name = 'Rovi Martinez' 
WHERE id = '8724bb9d-53df-457b-a089-ce3a39362d91';
