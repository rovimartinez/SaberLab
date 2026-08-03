-- Migración 0002: agrega columna teacher a tabla grupos
-- La tabla fue creada en 0001 sin esta columna, pero groups.js la requiere.

ALTER TABLE grupos ADD COLUMN teacher TEXT;
