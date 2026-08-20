export async function onRequestGet({ request, env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS solicitudes_acceso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      name TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (data.user.role !== 'admin' && normalizedEmail !== data.user.email?.toLowerCase()) {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }

    const row = await env.DB.prepare(
      'SELECT * FROM solicitudes_acceso WHERE lower(email) = ? ORDER BY created_at DESC'
    ).bind(normalizedEmail).first();

    return Response.json(row || null);
  }

  if (data.user.role !== 'admin') {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM solicitudes_acceso ORDER BY created_at DESC'
  ).all();
  return Response.json(results);
}

export async function onRequestPost({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { name, email, status = 'pending' } = body;
  if (!email) {
    return Response.json({ error: 'Falta el email' }, { status: 400 });
  }

  await env.DB.prepare(
    `INSERT INTO solicitudes_acceso (name, email, status, created_at)
     VALUES (?, ?, ?, datetime('now'))`
  ).bind(name || null, email.trim().toLowerCase(), status).run();

  return Response.json({ success: true });
}

export async function onRequestPatch({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, name, email, status } = body;
  if (!id) {
    return Response.json({ error: 'Falta el id' }, { status: 400 });
  }

  const row = await env.DB.prepare('SELECT * FROM solicitudes_acceso WHERE id = ?').bind(id).first();
  if (!row) {
    return Response.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  const normalizedEmail = email?.trim().toLowerCase();
  const isOwner = data.user.role === 'admin' || normalizedEmail === data.user.email?.toLowerCase() || row.email.toLowerCase() === data.user.email?.toLowerCase();
  if (!isOwner) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  await env.DB.prepare(
    `UPDATE solicitudes_acceso SET
       name = COALESCE(?, name),
       email = COALESCE(?, email),
       status = COALESCE(?, status)
     WHERE id = ?`
  ).bind(name || null, normalizedEmail || null, status || null, id).run();

  // Si se aprueba la solicitud, asegurar inscripción en los cursos disponibles
  if (status === 'approved') {
    try {
      const targetEmail = normalizedEmail || row.email.toLowerCase();
      const userProfile = await env.DB.prepare('SELECT id FROM perfiles WHERE lower(email) = ?').bind(targetEmail).first();
      if (userProfile?.id) {
        const { results: courses } = await env.DB.prepare('SELECT id FROM cursos').all();
        if (courses && courses.length > 0) {
          for (const c of courses) {
            await env.DB.prepare(
              'INSERT OR IGNORE INTO inscripciones (user_id, course_id) VALUES (?, ?)'
            ).bind(userProfile.id, c.id).run();
          }
        }
      }
    } catch (e) {
      console.error('Error auto-enrolling on approval:', e);
    }
  }

  return Response.json({ success: true });
}
