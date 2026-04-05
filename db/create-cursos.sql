DROP TABLE IF EXISTS cursos CASCADE;

CREATE TABLE cursos (
    id INTEGER PRIMARY KEY,
    abbr TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cursos" ON cursos FOR SELECT USING (true);
CREATE POLICY "Admin can manage cursos" ON cursos FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

INSERT INTO cursos (id, abbr, slug, name, description, color, icon) VALUES 
(1, 'EE', 'electricidad-y-electronica', 'Electricidad y Electrónica Básica', 'Aprende los fundamentos de la electricidad y electrónica', '#f59e0b', 'Zap'),
(2, 'FP', 'fundamentos-de-programacion', 'Fundamentos de Programación', 'Introducción a la lógica de programación', '#3b82f6', 'Code'),
(3, 'RE', 'robotica-educativa', 'Robótica Educativa', 'Construye y programa robots con Arduino', '#a855f7', 'Bot'),
(4, 'MQ', 'mediaciones-quimica', 'Mediaciones Tecnológicas en la Química', 'Explora la química a través de la tecnología', '#10b981', 'FlaskConical'),
(5, 'MA', 'modelado-3d', 'Modelado y Animación 3D', 'Crea modelos y animaciones en 3D', '#ec4899', 'Box'),
(6, 'TD', 'tendencias-tecnologia', 'Tendencias y Desarrollo en Tecnología', 'Descubre las tecnologías del futuro', '#f97316', 'Brain')
ON CONFLICT (id) DO NOTHING;
