export async function onRequestGet({ env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_usuario (
      user_id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();

  const row = await env.DB.prepare(
    'SELECT data FROM progreso_usuario WHERE user_id = ?'
  ).bind(data.user.id).first();

  try {
    const parsed = JSON.parse(row.data || '{}');
    return Response.json(parsed);
  } catch {
    return Response.json({ overall_progress: 0, streak_days: 0, total_hours: 0, lessons_completed: 0 });
  }
}

export async function onRequestPost({ request, env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_usuario (
      user_id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const userId = data.user.id;
  const current = await env.DB.prepare(
    'SELECT data FROM progreso_usuario WHERE user_id = ?'
  ).bind(userId).first();

  let existing = {};
  if (current?.data) {
    try {
      existing = JSON.parse(current.data);
    } catch {
      /* ignore */
    }
  }

  const merged = { ...existing, ...body };

  await env.DB.prepare(`
    INSERT INTO progreso_usuario (user_id, data)
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data
  `).bind(userId, JSON.stringify(merged)).run();

  return Response.json(merged);
}

