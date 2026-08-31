export async function onRequestGet({ env, data }) {
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

  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_temporary INTEGER DEFAULT 0').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN duration INTEGER DEFAULT 8').run(); } catch {}

  const userId = data.user.id;
  const userEmail = (data.user.email || '').toLowerCase();

  // Limpiar mensajes temporales antiguos de más de 10 minutos
  try {
    await env.DB.prepare(`
      DELETE FROM notificaciones 
      WHERE is_temporary = 1 AND datetime(created_at) <= datetime('now', '-10 minutes')
    `).run();
  } catch {}

  // Devolver solo las notificaciones persistentes que NO sean temporales
  const { results } = await env.DB.prepare(`
    SELECT id, title, message, read, sender_name, created_at 
    FROM notificaciones 
    WHERE (user_id = ? OR LOWER(user_id) = LOWER(?))
      AND (is_temporary = 0 OR is_temporary IS NULL)
    ORDER BY created_at DESC
  `).bind(userId, userEmail).all();

  return Response.json(results || []);
}

export async function onRequestPost({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.all) {
    await env.DB.prepare('UPDATE notificaciones SET read = 1 WHERE user_id = ?').bind(data.user.id).run();
    return Response.json({ success: true });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json({ error: 'Faltan ids' }, { status: 400 });
  }

  const placeholders = body.ids.map(() => '?').join(',');
  await env.DB.prepare(
    `UPDATE notificaciones SET read = 1 WHERE user_id = ? AND id IN (${placeholders})`
  ).bind(data.user.id, ...body.ids).run();

  return Response.json({ success: true });
}

export async function onRequestDelete({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.all) {
    await env.DB.prepare('DELETE FROM notificaciones WHERE user_id = ?').bind(data.user.id).run();
    return Response.json({ success: true });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json({ error: 'Faltan ids' }, { status: 400 });
  }

  const placeholders = body.ids.map(() => '?').join(',');
  await env.DB.prepare(
    `DELETE FROM notificaciones WHERE user_id = ? AND id IN (${placeholders})`
  ).bind(data.user.id, ...body.ids).run();

  return Response.json({ success: true });
}
