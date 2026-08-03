-- Migración 0001: esquema D1 (SQLite) para SaberLab.
-- Convertido desde PostgreSQL (Supabase). Tipos: uuid->TEXT, jsonb->TEXT, timestamptz->TEXT.

CREATE TABLE IF NOT EXISTS perfiles (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'student',
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cursos (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL,
  abbr    TEXT,
  slug    TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS inscripciones (
  user_id    TEXT NOT NULL REFERENCES perfiles(id),
  course_id  INTEGER NOT NULL REFERENCES cursos(id),
  group_id   INTEGER,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS grupos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES cursos(id),
  name      TEXT NOT NULL,
  teacher   TEXT
);

CREATE TABLE IF NOT EXISTS grupos_usuario (
  user_id  TEXT,
  group_id INTEGER,
  PRIMARY KEY (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id     INTEGER REFERENCES cursos(id),
  title         TEXT NOT NULL,
  description   TEXT,
  instructions  TEXT,
  questions     TEXT,
  time_limit    INTEGER,
  due_date      TEXT,
  is_published  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT REFERENCES perfiles(id),
  title       TEXT,
  message     TEXT,
  read        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS solicitudes_acceso (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  name        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visibilidad_curso (
  course_id  INTEGER PRIMARY KEY REFERENCES cursos(id),
  lecciones  TEXT
);

CREATE TABLE IF NOT EXISTS progreso_usuario (
  user_id   TEXT PRIMARY KEY,
  data      TEXT
);

CREATE TABLE IF NOT EXISTS intentos_evaluacion (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  evaluacion_id  INTEGER REFERENCES evaluaciones(id),
  user_id        TEXT REFERENCES perfiles(id),
  respuestas     TEXT,
  score          REAL,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_user   ON notificaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_insc_user    ON inscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_intentos_ev  ON intentos_evaluacion(evaluacion_id);
