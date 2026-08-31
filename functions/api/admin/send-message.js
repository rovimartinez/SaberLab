// ── API de Envío de Mensajes y Alertas a Estudiantes (Cloudflare D1) ──────────

export async function onRequestPost({ request, env, data }) {
  const role = (data.user?.role || '').toLowerCase();
  const email = (data.user?.email || '').toLowerCase();
  const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher'].includes(role) || (adminEmail && email === adminEmail);

  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores pueden enviar mensajes' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    mode = 'single',
    target_user_id,
    title = 'Mensaje del Docente',
    message,
    is_temporary = false,
    duration = 8
  } = body;

  const senderName = data.user.full_name || data.user.name || 'Prof. Ronny Martinez';

  if (!message || !message.trim()) {
    return Response.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
  }

  await ensureNotificationsSchema(env);

  const isTemp = is_temporary ? 1 : 0;
  const dur = Number(duration) || 8;

  if (mode === 'broadcast') {
    // 1. Enviar a todos los estudiantes en presencia activa reciente (últimos 30 min)
    let { results } = await env.DB.prepare(`
      SELECT DISTINCT user_id 
      FROM presencia_usuarios 
      WHERE datetime(last_seen) >= datetime('now', '-30 minutes')
        AND (role = 'student' OR role IS NULL)
    `).all();

    // Si no hay registrados en presencia reciente, enviar a todos los estudiantes de la tabla perfiles
    if (!results || results.length === 0) {
      const perfilesRes = await env.DB.prepare(`
        SELECT id as user_id FROM perfiles WHERE role = 'student' OR role IS NULL
      `).all();
      results = perfilesRes.results || [];
    }

    if (!results || results.length === 0) {
      return Response.json({ success: true, count: 0, message: 'No hay estudiantes conectados o registrados' });
    }

    const stmts = results.map(row => {
      return env.DB.prepare(`
        INSERT INTO notificaciones (user_id, title, message, sender_name, is_popup, is_temporary, duration, read, created_at)
        VALUES (?, ?, ?, ?, 1, ?, ?, 0, datetime('now'))
      `).bind(row.user_id, title.trim(), message.trim(), senderName, isTemp, dur);
    });

    await env.DB.batch(stmts);
    return Response.json({ success: true, count: results.length, mode: 'broadcast', is_temporary: Boolean(isTemp) });
  } else {
    // Modo 1 a 1 (Privado)
    if (!target_user_id) {
      return Response.json({ error: 'Debe especificar un target_user_id' }, { status: 400 });
    }

    // Resolver ID canónico del alumno si vino como email
    const profile = await env.DB.prepare(
      'SELECT id, email FROM perfiles WHERE id = ? OR LOWER(email) = LOWER(?)'
    ).bind(target_user_id, target_user_id).first();

    const targetId = profile?.id || target_user_id;

    await env.DB.prepare(`
      INSERT INTO notificaciones (user_id, title, message, sender_name, is_popup, is_temporary, duration, read, created_at)
      VALUES (?, ?, ?, ?, 1, ?, ?, 0, datetime('now'))
    `).bind(targetId, title.trim(), message.trim(), senderName, isTemp, dur).run();

    return Response.json({ success: true, mode: 'single', target_user_id: targetId, is_temporary: Boolean(isTemp) });
  }
}

async function ensureNotificationsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT,
      message TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      sender_name TEXT,
      is_popup INTEGER DEFAULT 1,
      is_temporary INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 8,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN sender_name TEXT').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_popup INTEGER DEFAULT 1').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_temporary INTEGER DEFAULT 0').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN duration INTEGER DEFAULT 8').run(); } catch {}
}
