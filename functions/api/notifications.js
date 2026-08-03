export async function onRequestGet({ env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT,
      message TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  const { results } = await env.DB.prepare(
    'SELECT * FROM notificaciones WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(data.user.id).all();
  return Response.json(results);
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
