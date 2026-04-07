-- Tabla para guardar los intentos de examen de los estudiantes
CREATE TABLE IF NOT EXISTS intentos_evaluacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    evaluation_key TEXT NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    score NUMERIC(5,2),
    passed BOOLEAN,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE intentos_evaluacion ENABLE ROW LEVEL SECURITY;

-- Policy admin can read all
CREATE POLICY "Admin ve todos los intentos" ON intentos_evaluacion FOR SELECT
USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Policy student can insert and read own
CREATE POLICY "Estudiante gestiona sus intentos" ON intentos_evaluacion FOR ALL
USING (auth.uid() = user_id);
