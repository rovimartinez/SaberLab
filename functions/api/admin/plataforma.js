// ── API de Administración de Plataforma (Cloudflare D1) ──────────────────────

export async function onRequestGet({ env, data }) {
  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  // Asegurar tablas
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS perfiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      name TEXT NOT NULL,
      teacher TEXT
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();

  const { results: perfiles } = await env.DB.prepare(
    'SELECT id, email, full_name, avatar_url, role, created_at FROM perfiles ORDER BY created_at DESC'
  ).all();

  const { results: grupos } = await env.DB.prepare(
    'SELECT id, course_id, name, teacher FROM grupos ORDER BY id DESC'
  ).all();

  const { results: grupos_usuario } = await env.DB.prepare(
    'SELECT user_id, group_id FROM grupos_usuario'
  ).all();

  return Response.json({
    perfiles: perfiles || [],
    cursos: [],
    grupos: grupos || [],
    grupos_usuario: grupos_usuario || []
  });
}
