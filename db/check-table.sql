-- Ver si la tabla existe y su estructura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visibilidad_curso';
