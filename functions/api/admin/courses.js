// ── API de Cursos en Admin (Cloudflare D1) ──────────────────────────────────

export async function onRequestPost({ request, env, data }) {
  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS cursos_config (
      id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  if (body.id) {
    await env.DB.prepare(`
      INSERT INTO cursos_config (id, data, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')
    `).bind(body.id, JSON.stringify(body)).run();
  }

  return Response.json({ success: true, course: body });
}
