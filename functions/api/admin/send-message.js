export async function onRequestPost({ request, env, data }) {
  const isStaff = data.user.role === 'admin' || data.user.role === 'docente';
  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores pueden enviar mensajes' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { mode = 'single', target_user_id, title = 'Mensaje del Docente', message } = body;
  const senderName = data.user.full_name || data.user.name || 'Prof. Ronny Martinez';

  if (!message || !message.trim()) {
    return Response.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
  }

  await ensureNotificationsSchema(env);

  if (mode === 'broadcast') {
    // Enviar a todos los estudiantes que están actualmente en línea (o a todos los perfiles de estudiantes)
    const { results } = await env.DB.prepare(`
      SELECT DISTINCT user_id 
      FROM presencia_usuarios 
      WHERE datetime(last_seen) >= datetime('now', '-2 minutes')
        AND (role = 'student' OR role IS NULL)
    `).all();

    if (!results || results.length === 0) {
      return Response.json({ success: true, count: 0, message: 'No hay estudiantes en línea actualmente' });
    }

    const stmts = results.map(row => {
      return env.DB.prepare(`
        INSERT INTO notificaciones (user_id, title, message, sender_name, is_popup, read, created_at)
        VALUES (?, ?, ?, ?, 1, 0, datetime('now'))
      `).bind(row.user_id, title.trim(), message.trim(), senderName);
    });

    await env.DB.batch(stmts);
    return Response.json({ success: true, count: results.length, mode: 'broadcast' });
  } else {
    // Modo 1 a 1 (Privado)
    if (!target_user_id) {
      return Response.json({ error: 'Debe especificar un target_user_id' }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO notificaciones (user_id, title, message, sender_name, is_popup, read, created_at)
      VALUES (?, ?, ?, ?, 1, 0, datetime('now'))
    `).bind(target_user_id, title.trim(), message.trim(), senderName).run();

    return Response.json({ success: true, mode: 'single', target_user_id });
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
