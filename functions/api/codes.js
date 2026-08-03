export async function onRequestGet({ request, env, data }) {
  await ensureCodesSchema(env);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const row = await env.DB.prepare('SELECT * FROM codigos_grupo WHERE id = ?').bind(id).first();
    return Response.json(row || null);
  }

  const { results } = await env.DB.prepare('SELECT * FROM codigos_grupo ORDER BY created_at DESC').all();
  return Response.json(results);
}

export async function onRequestPost({ request, env, data }) {
  await ensureCodesSchema(env);

  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { group_id, code, expires_at } = body;
  if (!group_id || !code) {
    return Response.json({ error: 'Falta group_id o code' }, { status: 400 });
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO codigos_grupo (group_id, code, expires_at)
     VALUES (?, ?, ?)`
  ).bind(group_id, code, expires_at ?? null).run();

  const row = await env.DB.prepare('SELECT * FROM codigos_grupo WHERE id = ?').bind(meta.last_row_id).first();
  return Response.json(row);
}

export async function onRequestDelete({ request, env, data }) {
  await ensureCodesSchema(env);

  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Falta el id' }, { status: 400 });
  }

  await env.DB.prepare('DELETE FROM codigos_grupo WHERE id = ?').bind(id).run();
  return Response.json({ success: true });
}

async function ensureCodesSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS codigos_grupo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      code TEXT UNIQUE NOT NULL,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
}
