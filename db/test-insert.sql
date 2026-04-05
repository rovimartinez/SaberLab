-- Insertar directamente un valor de prueba
INSERT INTO visibilidad_curso (course_id, lecciones)
VALUES (1, '{"l1": false, "l2": true}')
ON CONFLICT (course_id) DO UPDATE SET lecciones = EXCLUDED.lecciones;
