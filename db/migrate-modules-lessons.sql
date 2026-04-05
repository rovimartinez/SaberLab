-- Tabla de módulos
CREATE TABLE IF NOT EXISTS modulos (
    id TEXT PRIMARY KEY,
    course_id INTEGER REFERENCES cursos(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS lecciones (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES modulos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'content',
    duration TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anyone can read modulos" ON modulos FOR SELECT USING (true);
CREATE POLICY "Anyone can read lecciones" ON lecciones FOR SELECT USING (true);
CREATE POLICY "Admin can manage modulos" ON modulos FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can manage lecciones" ON lecciones FOR ALL USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND role = 'admin'));

-- Insertar módulos de Robótica Educativa (RE - course_id 3)
INSERT INTO modulos (id, course_id, name, order_index) VALUES
('re-m1', 3, 'Módulo 1: Fundamentos y Lógica Digital', 1),
('re-m2', 3, 'Módulo 2: Potencia, Movimiento y Ciclos', 2),
('re-m3', 3, 'Módulo 3: Percepción y Algoritmos Autónomos', 3),
('re-m4', 3, 'Módulo 4: Construcción y Didáctica', 4)
ON CONFLICT (id) DO NOTHING;

-- Insertar lecciones
INSERT INTO lecciones (id, module_id, title, type, duration, order_index) VALUES
-- Módulo 1
('re-m1-l1', 're-m1', 'Mi primer parpadeo', 'content', '15 min', 1),
('re-m1-l2', 're-m1', 'Semáforos y Variables', 'content', '20 min', 2),
('re-m1-l3', 're-m1', 'Entradas digitales y pulsadores', 'content', '25 min', 3),
('re-m1-l4', 're-m1', 'Monitor serie y depuración inicial', 'content', '18 min', 4),
('re-m1-l5', 're-m1', 'Entradas analógicas y resolución', 'content', '20 min', 5),
-- Módulo 2
('re-m2-l1', 're-m2', 'Modulación PWM y el Bucle for', 'content', '20 min', 1),
('re-m2-l2', 're-m2', 'Servomotores y Abstracción', 'content', '25 min', 2),
('re-m2-l3', 're-m2', 'Motores DC y el Puente H', 'content', '20 min', 3),
('re-m2-l4', 're-m2', 'Gestión de Energía y Seguridad', 'content', '15 min', 4),
('re-m2-l5', 're-m2', 'Programación Modular (Funciones)', 'quiz', '30 min', 5),
-- Módulo 3
('re-m3-l1', 're-m3', 'Sensor Ultrasonido (HC-SR04)', 'content', '20 min', 1),
('re-m3-l2', 're-m3', 'Infrarrojos y Operadores Lógicos', 'content', '18 min', 2),
('re-m3-l3', 're-m3', 'Sensores de Entorno', 'content', '15 min', 3),
('re-m3-l4', 're-m3', 'Algoritmos de Navegación', 'content', '25 min', 4),
-- Módulo 4
('re-m4-l1', 're-m4', 'Diseño Mecánico y Ensamblaje', 'content', '25 min', 1),
('re-m4-l2', 're-m4', 'Proyecto Integrador: El Robot Autónomo', 'quiz', '60 min', 2),
('re-m4-l3', 're-m4', 'Documentación Técnica y Pedagógica', 'content', '20 min', 3)
ON CONFLICT (id) DO NOTHING;
