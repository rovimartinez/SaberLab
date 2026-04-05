-- Agregar columna name a solicitudes_acceso
ALTER TABLE solicitudes_acceso ADD COLUMN IF NOT EXISTS name TEXT;

-- Agregar columna name a perfiles
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS name TEXT;
