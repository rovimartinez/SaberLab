export async function onRequestPost({ request, env, data }) {
  await ensurePresenceSchema(env);

  let body = {};
  try {
    body = await request.json();
  } catch {
    // Body opcional
  }

  const userId = data.user.id;
  const email = data.user.email || '';
  const fullName = data.user.full_name || data.user.name || email.split('@')[0];
  const role = data.user.role || 'student';
  const currentPage = body.current_page || '/';
  const activity = body.activity || 'Navegando en la plataforma';

  // 1. Actualizar latido de presencia
  try {
    await env.DB.prepare(`
      INSERT INTO presencia_usuarios (user_id, email, full_name, role, current_page, activity, last_seen)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        current_page = excluded.current_page,
        activity = excluded.activity,
        last_seen = datetime('now'),
        full_name = COALESCE(excluded.full_name, presencia_usuarios.full_name),
        role = COALESCE(excluded.role, presencia_usuarios.role)
    `).bind(userId, email, fullName, role, currentPage, activity).run();
  } catch (err) {
    console.error('Error actualizando presencia:', err);
  }

  // 2. Verificar si hay un mensaje emergente (popup) no leído para este alumno
  let directMessage = null;
  try {
    const unread = await env.DB.prepare(`
      SELECT id, title, message, sender_name, created_at 
      FROM notificaciones 
      WHERE user_id = ? AND read = 0 AND (is_popup = 1 OR is_popup IS NULL)
      ORDER BY id DESC LIMIT 1
    `).bind(userId).first();

    if (unread) {
      directMessage = unread;
    }
  } catch (err) {
    // Silencioso si no hay tabla o error
  }

  return Response.json({ ok: true, direct_message: directMessage });
}

export async function onRequestGet({ env, data }) {
  await ensurePresenceSchema(env);

  const isStaff = data.user.role === 'admin' || data.user.role === 'docente';
  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores' }, { status: 403 });
  }

  try {
    // Estudiantes activos en los últimos 2 minutos
    const { results } = await env.DB.prepare(`
      SELECT 
        user_id, 
        email, 
        full_name, 
        role, 
        current_page, 
        activity, 
        last_seen,
        CAST((julianday('now') - julianday(last_seen)) * 86400 AS INTEGER) AS seconds_ago
      FROM presencia_usuarios
      WHERE datetime(last_seen) >= datetime('now', '-2 minutes')
        AND (role = 'student' OR role IS NULL)
      ORDER BY last_seen DESC
    `).all();

    return Response.json({ online_students: results || [] });
  } catch (err) {
    console.error('Error consultando presencia:', err);
    return Response.json({ online_students: [] });
  }
}

async function ensurePresenceSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS presencia_usuarios (
      user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT,
      role TEXT,
      current_page TEXT,
      activity TEXT,
      last_seen TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT,
      message TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      sender_name TEXT,
      is_popup INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try {
    await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN sender_name TEXT').run();
  } catch {}
  try {
    await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_popup INTEGER DEFAULT 1').run();
  } catch {}
}
