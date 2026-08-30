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

  if (status === 'approved') {
    const targetEmail = (normalizedEmail || row.email).toLowerCase();
    try {
      await env.DB.prepare(
        "UPDATE perfiles SET access_status = 'approved' WHERE LOWER(email) = LOWER(?)"
      ).bind(targetEmail).run();

      // Si no tiene cursos inscritos aún, inscribir en el curso base por defecto (Electricidad y Electrónica)
      const userProfile = await env.DB.prepare(
        "SELECT id FROM perfiles WHERE LOWER(email) = LOWER(?)"
      ).bind(targetEmail).first();

      if (userProfile?.id) {
        const existingEnrollment = await env.DB.prepare(
          "SELECT course_id FROM inscripciones WHERE user_id = ? LIMIT 1"
        ).bind(userProfile.id).first();

        if (!existingEnrollment) {
          let defaultGroup = await env.DB.prepare("SELECT id FROM grupos WHERE course_id = 1 LIMIT 1").first();
          const groupId = defaultGroup?.id || 1;
          await env.DB.prepare("INSERT OR IGNORE INTO inscripciones (user_id, course_id, group_id) VALUES (?, 1, ?)").bind(userProfile.id, groupId).run();
          await env.DB.prepare("INSERT OR IGNORE INTO grupos_usuario (user_id, group_id) VALUES (?, ?)").bind(userProfile.id, groupId).run();
        }
      }
    } catch (profileSyncErr) {
      console.error('Error synchronizing approved status to perfiles:', profileSyncErr);
    }
  }

  return Response.json({ success: true });
}
