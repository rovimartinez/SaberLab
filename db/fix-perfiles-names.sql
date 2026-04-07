-- Agregar columnas de nombre y apellido faltantes a la tabla perfiles
-- Referencia: Tarea "Sidebar mostrando Display Name / Corregido error Cargando"
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS last_name TEXT;
