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

  // Si se solicita explícitamente salida / offline
  if (body.action === 'leave' || body.is_online === 0) {
    try {
      await env.DB.prepare(`
        UPDATE presencia_usuarios 
        SET is_online = 0, last_seen = datetime('now')
        WHERE user_id = ? OR LOWER(email) = LOWER(?)
      `).bind(userId, email).run();
    } catch (err) {
      console.error('Error marcando salida:', err);
    }
    return Response.json({ ok: true, is_online: 0 });
  }

  // 1. Actualizar latido de presencia con is_online = 1
  try {
    await env.DB.prepare(`
      INSERT INTO presencia_usuarios (user_id, email, full_name, role, current_page, activity, is_online, last_seen)
      VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        current_page = excluded.current_page,
        activity = excluded.activity,
        is_online = 1,
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
      SELECT id, title, message, sender_name, is_temporary, duration, created_at 
      FROM notificaciones 
      WHERE (user_id = ? OR LOWER(user_id) = LOWER(?)) 
        AND read = 0 
        AND (is_popup = 1 OR is_popup IS NULL)
      ORDER BY id DESC LIMIT 1
    `).bind(userId, email).first();

    if (unread) {
      directMessage = {
        ...unread,
        is_temporary: Boolean(unread.is_temporary),
        duration: unread.duration || 8
      };

      // Si es un mensaje temporal, marcarlo inmediatamente como leído en D1 para que no se repita
      if (unread.is_temporary) {
        await env.DB.prepare('UPDATE notificaciones SET read = 1 WHERE id = ?').bind(unread.id).run();
      }
    }
  } catch (err) {
    console.error('Error fetching unread message in presence:', err);
  }

  return Response.json({ ok: true, is_online: 1, direct_message: directMessage });
}

export async function onRequestDelete({ env, data }) {
  await ensurePresenceSchema(env);
  const userId = data.user.id;
  const email = data.user.email || '';

  try {
    await env.DB.prepare(`
      UPDATE presencia_usuarios 
      SET is_online = 0, last_seen = datetime('now')
      WHERE user_id = ? OR LOWER(email) = LOWER(?)
    `).bind(userId, email).run();
  } catch (err) {
    console.error('Error cerrando presencia en DELETE:', err);
  }

  return Response.json({ ok: true, is_online: 0 });
}

export async function onRequestGet({ env, data }) {
  await ensurePresenceSchema(env);

  const role = (data.user?.role || '').toLowerCase();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher'].includes(role);
  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores' }, { status: 403 });
  }

  try {
    // Estudiantes activos con is_online = 1 y actividad dentro de los últimos 2 minutos
    const { results } = await env.DB.prepare(`
      SELECT 
        pu.user_id, 
        pu.email, 
        COALESCE(p.full_name, pu.full_name) AS full_name, 
        p.avatar_url,
        pu.role, 
        pu.current_page, 
        pu.activity, 
        pu.is_online,
        pu.last_seen,
        CAST((julianday('now') - julianday(pu.last_seen)) * 86400 AS INTEGER) AS seconds_ago
      FROM presencia_usuarios pu
      LEFT JOIN perfiles p ON (p.id = pu.user_id OR LOWER(p.email) = LOWER(pu.email))
      WHERE (pu.is_online = 1 OR pu.is_online IS NULL)
        AND datetime(pu.last_seen) >= datetime('now', '-2 minutes')
        AND (pu.role != 'admin' AND pu.role != 'docente' AND pu.role != 'profesor')
      ORDER BY pu.last_seen DESC
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
      is_online INTEGER DEFAULT 1,
      last_seen TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try {
    await env.DB.prepare('ALTER TABLE presencia_usuarios ADD COLUMN is_online INTEGER DEFAULT 1').run();
  } catch {}

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
