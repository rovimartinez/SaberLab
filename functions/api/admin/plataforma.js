// ── API de Administración de Plataforma (Cloudflare D1) ──────────────────────

function checkIsAdmin(data, env) {
  const role = (data.user?.role || '').toLowerCase();
  const email = (data.user?.email || '').toLowerCase();
  const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase();
  return role === 'admin' || role === 'docente' || role === 'profesor' || (adminEmail && email === adminEmail);
}

export async function onRequestGet({ env, data }) {
  if (!checkIsAdmin(data, env)) {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  await ensureAdminTables(env);

  try {
    const { results: perfiles } = await env.DB.prepare(
      'SELECT id, email, full_name, avatar_url, role, created_at FROM perfiles ORDER BY created_at DESC'
    ).all();

    const { results: grupos } = await env.DB.prepare(
      'SELECT id, course_id, name, teacher FROM grupos ORDER BY id DESC'
    ).all();

    const { results: grupos_usuario } = await env.DB.prepare(
      'SELECT user_id, group_id FROM grupos_usuario'
    ).all();

    let inscripciones = [];
    try {
      const { results } = await env.DB.prepare(
        'SELECT user_id, course_id, group_id FROM inscripciones'
      ).all();
      inscripciones = results || [];
    } catch {
      try {
        const { results } = await env.DB.prepare(
          'SELECT user_id, course_id FROM inscripciones'
        ).all();
        inscripciones = results || [];
      } catch {}
    }

    let cursos = [];
    try {
      const { results } = await env.DB.prepare('SELECT id, name, abbr, slug FROM cursos').all();
      cursos = results || [];
    } catch {}

    if (!cursos || cursos.length === 0) {
      cursos = [
        { id: 1, name: 'Electricidad y Electrónica Básica', abbr: 'EE', slug: 'electricidad-y-electronica' },
        { id: 5, name: 'Robótica Educativa', abbr: 'RE', slug: 'robotica-educativa' }
      ];
    }

    return Response.json({
      perfiles: perfiles || [],
      cursos,
      grupos: grupos || [],
      grupos_usuario: grupos_usuario || [],
      inscripciones: inscripciones || []
    });
  } catch (err) {
    console.error('Error in onRequestGet plataforma:', err);
    return Response.json({ error: err.message || 'Error consultando plataforma' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, data }) {
  if (!checkIsAdmin(data, env)) {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  await ensureAdminTables(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.action === 'delete') {
    return await executeDeleteUser(body.user_id, env, data);
  }

  return await executeUpdateUser(body, env, data);
}

export async function onRequestPatch({ request, env, data }) {
  if (!checkIsAdmin(data, env)) {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  await ensureAdminTables(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  return await executeUpdateUser(body, env, data);
}

export async function onRequestDelete({ request, env, data }) {
  if (!checkIsAdmin(data, env)) {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  await ensureAdminTables(env);

  let userId;
  try {
    const body = await request.json();
    userId = body?.user_id;
  } catch {
    const url = new URL(request.url);
    userId = url.searchParams.get('user_id');
  }

  return await executeDeleteUser(userId, env, data);
}

async function executeUpdateUser(body, env, data) {
  const { user_id, full_name, role, group_id } = body;
  if (!user_id) {
    return Response.json({ error: 'Falta user_id' }, { status: 400 });
  }

  try {
    const profileRow = await env.DB.prepare(
      'SELECT id, email, full_name, role FROM perfiles WHERE id = ? OR LOWER(email) = LOWER(?)'
    ).bind(user_id, user_id).first();

    const targetUserId = profileRow?.id || user_id;
    const targetEmail = (profileRow?.email || user_id).toLowerCase();

    // 1. Actualizar datos en perfiles si se enviaron
    if (role !== undefined || full_name !== undefined) {
      await env.DB.prepare(`
        UPDATE perfiles SET
          role = COALESCE(?, role),
          full_name = COALESCE(?, full_name)
        WHERE id = ? OR LOWER(email) = LOWER(?)
      `).bind(role || null, full_name || null, targetUserId, targetEmail).run();
    }

    // 2. Si se solicitó asignar o cambiar grupo
    if (group_id !== undefined) {
      // Retirar del grupo actual si existe
      await env.DB.prepare(
        'DELETE FROM grupos_usuario WHERE user_id = ? OR LOWER(user_id) = LOWER(?)'
      ).bind(targetUserId, targetEmail).run();

      if (group_id && group_id !== 'none') {
        const numGid = parseInt(group_id, 10);
        const targetGid = isNaN(numGid) ? group_id : numGid;

        // Vincular al grupo
        await env.DB.prepare(
          'INSERT OR REPLACE INTO grupos_usuario (user_id, group_id) VALUES (?, ?)'
        ).bind(targetUserId, targetGid).run();

        // Buscar el curso del grupo para inscribir al usuario
        let courseId = (targetGid === 5 || targetGid === 4) ? 5 : 1;
        try {
          const groupRow = await env.DB.prepare(
            'SELECT course_id, name FROM grupos WHERE id = ? OR CAST(id AS TEXT) = ?'
          ).bind(targetGid, String(targetGid)).first();

          if (groupRow?.course_id) {
            courseId = groupRow.course_id;
          } else if (groupRow?.name?.includes('RE') || groupRow?.name?.includes('Robótica')) {
            courseId = 5;
          } else if (groupRow?.name?.includes('EE') || groupRow?.name?.includes('Electricidad')) {
            courseId = 1;
          }
        } catch {}

        // Inscribir en inscripciones
        try {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO inscripciones (user_id, course_id, group_id) VALUES (?, ?, ?)'
          ).bind(targetUserId, courseId, targetGid).run();
        } catch {
          try {
            await env.DB.prepare(
              'INSERT OR REPLACE INTO inscripciones (user_id, course_id) VALUES (?, ?)'
            ).bind(targetUserId, courseId).run();
          } catch (insErr) {
            console.error('Error insertando en inscripciones:', insErr);
          }
        }

        // Auto-aprobar solicitud si existía
        try {
          await env.DB.prepare(
            "UPDATE solicitudes_acceso SET status = 'approved' WHERE LOWER(email) = LOWER(?)"
          ).bind(targetEmail).run();
        } catch {}
      }
    }

    return Response.json({ success: true, message: 'Usuario actualizado con éxito' });
  } catch (err) {
    console.error('Error in executeUpdateUser:', err);
    return Response.json({ error: err.message || 'Error al actualizar usuario' }, { status: 500 });
  }
}

async function executeDeleteUser(userId, env, data) {
  if (!userId) {
    return Response.json({ error: 'Falta user_id' }, { status: 400 });
  }

  // Protección: No permitir eliminar al propio usuario autenticado
  if (userId === data.user.id || (data.user.email && userId.toLowerCase() === data.user.email.toLowerCase())) {
    return Response.json({ error: 'No puedes eliminar tu propia cuenta de administrador' }, { status: 400 });
  }

  try {
    const profileRow = await env.DB.prepare(
      'SELECT id, email FROM perfiles WHERE id = ? OR LOWER(email) = LOWER(?)'
    ).bind(userId, userId).first();

    const targetUserId = profileRow?.id || userId;
    const userEmail = (profileRow?.email || (userId.includes('@') ? userId : '')).toLowerCase();

    // Borrar de perfiles
    await env.DB.prepare(
      'DELETE FROM perfiles WHERE id = ? OR LOWER(email) = LOWER(?)'
    ).bind(targetUserId, userEmail).run();

    // Borrar de solicitudes_acceso
    if (userEmail) {
      await env.DB.prepare(
        'DELETE FROM solicitudes_acceso WHERE LOWER(email) = LOWER(?)'
      ).bind(userEmail).run();
    }

    // Borrar de grupos_usuario
    await env.DB.prepare(
      'DELETE FROM grupos_usuario WHERE user_id = ? OR LOWER(user_id) = LOWER(?)'
    ).bind(targetUserId, userEmail).run();

    // Borrar de inscripciones
    await env.DB.prepare(
      'DELETE FROM inscripciones WHERE user_id = ? OR LOWER(user_id) = LOWER(?)'
    ).bind(targetUserId, userEmail).run();

    // Borrar de presencia_usuarios
    await env.DB.prepare(
      'DELETE FROM presencia_usuarios WHERE user_id = ? OR LOWER(email) = LOWER(?)'
    ).bind(targetUserId, userEmail).run();

    return Response.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error in executeDeleteUser:', err);
    return Response.json({ error: err.message || 'Error al eliminar usuario' }, { status: 500 });
  }
}

async function ensureAdminTables(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS perfiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE perfiles ADD COLUMN avatar_url TEXT').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE perfiles ADD COLUMN role TEXT DEFAULT "student"').run(); } catch {}

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      name TEXT NOT NULL,
      teacher TEXT
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE grupos ADD COLUMN course_id INTEGER').run(); } catch {}

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS inscripciones (
      user_id TEXT,
      course_id INTEGER,
      group_id INTEGER,
      PRIMARY KEY (user_id, course_id)
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE inscripciones ADD COLUMN group_id INTEGER').run(); } catch {}
}
