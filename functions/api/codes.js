export async function onRequestGet({ request, env, data }) {
  await ensureCodesSchema(env);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const code = url.searchParams.get('code');

  if (id) {
    const row = await env.DB.prepare('SELECT * FROM codigos_grupo WHERE id = ?').bind(id).first();
    return Response.json(row || null);
  }

  if (code) {
    const row = await env.DB.prepare('SELECT * FROM codigos_grupo WHERE UPPER(code) = ?').bind(code.toUpperCase()).first();
    return Response.json(row || null);
  }

  const { results } = await env.DB.prepare('SELECT * FROM codigos_grupo ORDER BY created_at DESC').all();
  return Response.json(results || []);
}

export async function onRequestPost({ request, env, data }) {
  await ensureCodesSchema(env);

  const isStaff = data.user.role === 'admin' || data.user.role === 'docente';
  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores pueden generar códigos' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  let { group_id, course_id, code, expires_at } = body;
  if (!code) {
    return Response.json({ error: 'Falta el código' }, { status: 400 });
  }

  code = code.trim().toUpperCase();

  // Si no tiene group_id pero tiene course_id, buscar o crear un grupo base para el curso
  if (!group_id && course_id) {
    let group = await env.DB.prepare('SELECT id FROM grupos WHERE course_id = ? LIMIT 1').bind(course_id).first();
    if (!group) {
      const { meta } = await env.DB.prepare(
        'INSERT INTO grupos (name, course_id) VALUES (?, ?)'
      ).bind(`Grupo General`, course_id).run();
      group_id = meta.last_row_id;
    } else {
      group_id = group.id;
    }
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO codigos_grupo (group_id, course_id, code, expires_at)
     VALUES (?, ?, ?, ?)`
  ).bind(group_id ?? null, course_id ?? null, code, expires_at ?? null).run();

  const row = await env.DB.prepare('SELECT * FROM codigos_grupo WHERE id = ?').bind(meta.last_row_id).first();
  return Response.json(row);
}

export async function onRequestPut({ request, env, data }) {
  await ensureCodesSchema(env);

  const isStaff = data.user.role === 'admin' || data.user.role === 'docente';
  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores pueden modificar códigos' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, expires_at } = body;
  if (!id) {
    return Response.json({ error: 'Falta el id del código' }, { status: 400 });
  }

  // Actualizar la fecha de expiración para dar más tiempo
  await env.DB.prepare(
    'UPDATE codigos_grupo SET expires_at = ? WHERE id = ?'
  ).bind(expires_at ?? null, id).run();

  const row = await env.DB.prepare('SELECT * FROM codigos_grupo WHERE id = ?').bind(id).first();
  return Response.json({ success: true, code: row });
}

export async function onRequestDelete({ request, env, data }) {
  await ensureCodesSchema(env);

  const isStaff = data.user.role === 'admin' || data.user.role === 'docente';
  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores' }, { status: 403 });
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
      course_id INTEGER,
      code TEXT UNIQUE NOT NULL,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try {
    await env.DB.prepare('ALTER TABLE codigos_grupo ADD COLUMN course_id INTEGER').run();
  } catch {}
}
