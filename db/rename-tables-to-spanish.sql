-- =====================================================
-- RENOMBRAR TABLAS A ESPAÑOL (SOLO LAS EN USO)
-- Tablas que realmente se usan en el código
-- =====================================================

-- 1. PERFILES
CREATE TABLE perfiles AS SELECT * FROM profiles;
ALTER TABLE perfiles ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS profiles;

-- 2. SOLICITUDES DE ACCESO
CREATE TABLE solicitudes_acceso AS SELECT * FROM access_requests;
ALTER TABLE solicitudes_acceso ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS access_requests;

-- 3. NOTIFICACIONES
CREATE TABLE notificaciones AS SELECT * FROM notifications;
ALTER TABLE notificaciones ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS notifications;

-- 4. CURSOS
CREATE TABLE cursos AS SELECT * FROM courses;
ALTER TABLE cursos ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS courses;

-- 5. GRUPOS
CREATE TABLE grupos AS SELECT * FROM groups;
ALTER TABLE grupos ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS groups;

-- 6. CÓDIGOS DE GRUPO
CREATE TABLE codigos_grupo AS SELECT * FROM group_codes;
ALTER TABLE codigos_grupo ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS group_codes;

-- 7. INSCRIPCIONES
CREATE TABLE inscripciones AS SELECT * FROM enrollments;
ALTER TABLE inscripciones ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS enrollments;

-- 8. EVALUACIONES
CREATE TABLE evaluaciones AS SELECT * FROM evaluations;
ALTER TABLE evaluaciones ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS evaluations;

-- 9. VISIBILIDAD DE LECCIONES
CREATE TABLE visibilidad_leccion_curso AS SELECT * FROM course_lesson_visibility;
ALTER TABLE visibilidad_leccion_curso ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS course_lesson_visibility;

-- 10. GRUPOS DE USUARIOS
CREATE TABLE grupos_usuario AS SELECT * FROM user_groups;
ALTER TABLE grupos_usuario ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS user_groups;

-- 11. PROGRESO DE USUARIO
CREATE TABLE progreso_usuario AS SELECT * FROM user_progress;
ALTER TABLE progreso_usuario ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS user_progress;

-- 12. LOGROS
CREATE TABLE logros AS SELECT * FROM achievements;
ALTER TABLE logros ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS achievements;

-- 13. TARJETAS ESTUDIANTE (FLASHCARDS)
CREATE TABLE tarjetas_estudiante AS SELECT * FROM student_flashcards;
ALTER TABLE tarjetas_estudiante ADD PRIMARY KEY (id);
DROP TABLE IF EXISTS student_flashcards;

-- =====================================================
-- REACTIVAR RLS Y POLÍTICAS EN NUEVAS TABLAS
-- =====================================================

-- Perfiles RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfiles pueden ser leídos por todos" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Perfiles pueden ser actualizados por sus dueños" ON perfiles FOR UPDATE USING (auth.uid() = id);

-- Solicitudes acceso RLS
ALTER TABLE solicitudes_acceso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solicitudes pueden ser leídas" ON solicitudes_acceso FOR SELECT USING (true);

-- Notificaciones RLS
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notificaciones propias" ON notificaciones FOR ALL USING (auth.uid() = user_id);

-- Grupos RLS
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grupos pueden ser leídos" ON grupos FOR SELECT USING (true);

-- Inscripciones RLS
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inscripciones propias" ON inscripciones FOR ALL USING (auth.uid() = user_id);

-- Evaluaciones RLS
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evaluaciones pueden ser leídas" ON evaluaciones FOR SELECT USING (true);

-- Visibilidad lección curso RLS
ALTER TABLE visibilidad_leccion_curso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visibilidad admins" ON visibilidad_leccion_curso FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Visibilidad/leer" ON visibilidad_leccion_curso FOR SELECT USING (auth.role() = 'authenticated');

-- Código grupo RLS
ALTER TABLE codigos_grupo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Códigos pueden ser leídos" ON codigos_grupo FOR SELECT USING (true);

-- Grupos usuario RLS
ALTER TABLE grupos_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grupos usuario pueden ser leídos" ON grupos_usuario FOR SELECT USING (true);

-- Progreso usuario RLS
ALTER TABLE progreso_usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progreso propio" ON progreso_usuario FOR ALL USING (auth.uid() = user_id);

-- Logros RLS
ALTER TABLE logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logros pueden ser leídos" ON logros FOR SELECT USING (true);

-- Tarjetas estudiante RLS
ALTER TABLE tarjetas_estudiante ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tarjetas propias" ON tarjetas_estudiante FOR ALL USING (auth.uid() = user_id);
