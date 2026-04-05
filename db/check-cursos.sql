-- Ver estructura actual de cursos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cursos';
