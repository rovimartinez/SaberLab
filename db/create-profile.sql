-- Crear perfil para el usuario si no existe
INSERT INTO perfiles (id, email, role, full_name, created_at, updated_at)
VALUES ('8724bb9d-53df-457b-a089-ce3a39362d91', 'rovimartinez@gmail.com', 'admin', 'Rovi Martinez', now(), now())
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Rovi Martinez';
