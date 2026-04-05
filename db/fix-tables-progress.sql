-- Agregar columnas faltantes a progreso_usuario
ALTER TABLE progreso_usuario ADD COLUMN IF NOT EXISTS overall_progress INTEGER DEFAULT 0;
ALTER TABLE progreso_usuario ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE progreso_usuario ADD COLUMN IF NOT EXISTS total_hours REAL DEFAULT 0;
ALTER TABLE progreso_usuario ADD COLUMN IF NOT EXISTS lessons_completed INTEGER DEFAULT 0;

-- Agregar columnas faltantes a logros
ALTER TABLE logros ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE logros ADD COLUMN IF NOT EXISTS unlocked BOOLEAN DEFAULT false;
ALTER TABLE logros ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ;

-- Actualizar política RLS de logros para logros propios
DROP POLICY IF EXISTS "Logros pueden ser leídos" ON logros;
ALTER TABLE logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logros propios" ON logros FOR ALL USING (auth.uid() = user_id);
