-- =====================================================
-- RENOMBRAR TABLAS A ESPAÑOL (CON DEPENDENCIAS)
-- Versión que elimina objetos dependientes primero
-- =====================================================

-- 0. Eliminar políticas RLS que dependen de las tablas a renombrar
-- (No se puede hacer directamente, pero al hacer DROP CASCADE se eliminan)

-- 1. PERFILES
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE perfiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SOLICITUDES DE ACCESO
DROP TABLE IF EXISTS access_requests CASCADE;
CREATE TABLE solicitudes_acceso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. NOTIFICACIONES
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CURSOS
DROP TABLE IF EXISTS courses CASCADE;
CREATE TABLE cursos (
    id INTEGER PRIMARY KEY,
    name TEXT,
    teacher TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GRUPOS
DROP TABLE IF EXISTS groups CASCADE;
CREATE TABLE grupos (
    id TEXT PRIMARY KEY,
    course_id INTEGER REFERENCES cursos(id) ON DELETE CASCADE,
    name TEXT,
    teacher TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CÓDIGOS DE GRUPO
DROP TABLE IF EXISTS group_codes CASCADE;
CREATE TABLE codigos_grupo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id TEXT REFERENCES grupos(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INSCRIPCIONES
DROP TABLE IF EXISTS enrollments CASCADE;
CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES cursos(id) ON DELETE CASCADE,
    group_id TEXT REFERENCES grupos(id) ON DELETE SET NULL,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. EVALUACIONES
DROP TABLE IF EXISTS evaluations CASCADE;
CREATE TABLE evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id INTEGER,
    module_id TEXT,
    evaluation_key TEXT NOT NULL,
    title TEXT,
    type TEXT,
    max_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. VISIBILIDAD DE LECCIONES
DROP TABLE IF EXISTS course_lesson_visibility CASCADE;
CREATE TABLE visibilidad_leccion_curso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    visible BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, lesson_id)
);

-- 10. GRUPOS DE USUARIOS
DROP TABLE IF EXISTS user_groups CASCADE;
CREATE TABLE grupos_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    group_id TEXT REFERENCES grupos(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PROGRESO DE USUARIO
DROP TABLE IF EXISTS user_progress CASCADE;
CREATE TABLE progreso_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    course_id INTEGER,
    lesson_id TEXT,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. LOGROS
DROP TABLE IF EXISTS achievements CASCADE;
CREATE TABLE logros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. TARJETAS ESTUDIANTE (FLASHCARDS)
DROP TABLE IF EXISTS student_flashcards CASCADE;
CREATE TABLE tarjetas_estudiante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    mastery_level INTEGER DEFAULT 0,
    next_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- COPIAR DATOS DESDE TABLAS ANTIGUAS (si aún existen)
-- =====================================================

-- Copiar perfiles (si la tabla profiles aún tiene datos)
-- INSERT INTO perfiles SELECT * FROM profiles;

-- NOTA: Debés ejecutar las líneas de arriba para cada tabla que tenga datos
-- Ejemplo: INSERT INTO perfiles SELECT * FROM profiles;

-- =====================================================
-- RECREAR POLÍTICAS RLS
-- =====================================================

-- Perfiles
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfiles pueden ser leídos" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Perfiles pueden ser actualizados" ON perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Perfiles pueden ser insertados" ON perfiles FOR INSERT WITH CHECK (true);

-- Solicitudes acceso
ALTER TABLE solicitudes_acceso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solicitudes pueden ser leídas" ON solicitudes_acceso FOR SELECT USING (true);
CREATE POLICY "Solicitudes pueden ser insertadas" ON solicitudes_acceso FOR INSERT WITH CHECK (true);
CREATE POLICY "Solicitudes pueden ser actualizadas" ON solicitudes_acceso FOR UPDATE USING (true);

-- Notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notificaciones propias" ON notificaciones FOR ALL USING (auth.uid() = user_id);

-- Grupos
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grupos pueden ser leídos" ON grupos FOR SELECT USING (true);
CREATE POLICY "Grupos pueden ser administrados" ON grupos FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Inscripciones
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inscripciones propias" ON inscripciones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin ve todas" ON inscripciones FOR SELECT USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Evaluaciones
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evaluaciones pueden ser leídas" ON evaluaciones FOR SELECT USING (true);
CREATE POLICY "Evaluaciones admin" ON evaluaciones FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Visibilidad lección curso
ALTER TABLE visibilidad_leccion_curso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visibilidad admins" ON visibilidad_leccion_curso FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Visibilidad leer" ON visibilidad_leccion_curso FOR SELECT USING (auth.role() = 'authenticated');

-- Código grupo
ALTER TABLE codigos_grupo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Códigos pueden ser leídos" ON codigos_grupo FOR SELECT USING (true);

-- Grupos usuario
ALTER TABLE grupos_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grupos usuario pueden ser leídos" ON grupos_usuario FOR SELECT USING (true);

-- Progreso usuario
ALTER TABLE progreso_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progreso propio" ON progreso_usuario FOR ALL USING (auth.uid() = user_id);

-- Logros
ALTER TABLE logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logros pueden ser leídos" ON logros FOR SELECT USING (true);

-- Tarjetas estudiante
ALTER TABLE tarjetas_estudiante ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tarjetas propias" ON tarjetas_estudiante FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- ÍNDICES RECOMENDADOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_perfiles_email ON perfiles(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_role ON perfiles(role);
CREATE INDEX IF NOT EXISTS idx_solicitudes_acceso_email ON solicitudes_acceso(email);
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id ON notificaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_read ON notificaciones(read);
CREATE INDEX IF NOT EXISTS idx_grupos_course_id ON grupos(course_id);
CREATE INDEX IF NOT EXISTS idx_codigos_grupo_code ON codigos_grupo(code);
CREATE INDEX IF NOT EXISTS idx_inscripciones_user_id ON inscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_course_id ON inscripciones(course_id);
CREATE INDEX IF NOT EXISTS idx_visibilidad_course_id ON visibilidad_leccion_curso(course_id);
CREATE INDEX IF NOT EXISTS idx_progreso_user_id ON progreso_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_progreso_course_id ON progreso_usuario(course_id);
CREATE INDEX IF NOT EXISTS idx_tarjetas_user_id ON tarjetas_estudiante(user_id);
CREATE INDEX IF NOT EXISTS idx_tarjetas_lesson_id ON tarjetas_estudiante(lesson_id);
