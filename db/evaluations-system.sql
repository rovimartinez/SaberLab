-- =====================================================
-- MEJORAR TABLA EVALUACIONES
-- =====================================================

-- Agregar columnas faltantes a evaluaciones
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS grade INTEGER;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS time_limit INTEGER; -- minutos
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 70; -- % para pasar
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE evaluaciones ADD COLUMN IF NOT EXISTS instructions TEXT;

-- =====================================================
-- TABLA: EVALUACIONES_GRUPO
-- Asigna evaluaciones a grupos específicos
-- =====================================================
DROP TABLE IF EXISTS evaluaciones_grupo CASCADE;
CREATE TABLE evaluaciones_grupo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES evaluaciones(id) ON DELETE CASCADE,
    grupo_id TEXT REFERENCES grupos(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    due_date TIMESTAMPTZ,
    UNIQUE(evaluacion_id, grupo_id)
);

-- RLS para evaluaciones_grupo
ALTER TABLE evaluaciones_grupo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gestiona evaluaciones_grupo" ON evaluaciones_grupo FOR ALL 
    USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Estudiantes ven evaluaciones asignadas" ON evaluaciones_grupo FOR SELECT 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- TABLA: EVALUACION_PREGUNTAS
-- Preguntas almacenadas en BD (opcional, puede coexistir con código)
-- =====================================================
DROP TABLE IF EXISTS evaluacion_preguntas CASCADE;
CREATE TABLE evaluacion_preguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES evaluaciones(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
    options JSONB, -- ["opcion1", "opcion2", "opcion3", "opcion4"]
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 10,
    concept TEXT,
    objective TEXT,
    difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para evaluacion_preguntas
ALTER TABLE evaluacion_preguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gestiona preguntas" ON evaluacion_preguntas FOR ALL 
    USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Estudiantes ven preguntas" ON evaluacion_preguntas FOR SELECT 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- TABLA: EVALUACION_INTENTOS
-- Intentos de estudiantes
-- =====================================================
DROP TABLE IF EXISTS evaluacion_intentos CASCADE;
CREATE TABLE evaluacion_intentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES evaluaciones(id) ON DELETE CASCADE,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    group_id TEXT REFERENCES grupos(id) ON DELETE SET NULL,
    score INTEGER,
    answers JSONB,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER,
    passed BOOLEAN,
    UNIQUE(evaluacion_id, user_id)
);

-- RLS para evaluacion_intentos
ALTER TABLE evaluacion_intentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estudiante ve sus intentos" ON evaluacion_intentos FOR ALL 
    USING (auth.uid() = user_id);
CREATE POLICY "Admin ve todos los intentos" ON evaluacion_intentos FOR SELECT 
    USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_evaluaciones_course ON evaluaciones(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_published ON evaluaciones(is_published);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_grupo_evaluacion ON evaluaciones_grupo(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_grupo_grupo ON evaluaciones_grupo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_evaluacion_preguntas_evaluacion ON evaluacion_preguntas(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_evaluacion_intentos_user ON evaluacion_intentos(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluacion_intentos_evaluacion ON evaluacion_intentos(evaluacion_id);
