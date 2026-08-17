// ── API de Progreso de Lecciones (Cloudflare D1) ──────────────────────────────

export async function onRequestGet({ request, env, data }) {
  await ensureLessonProgressSchema(env);

  const url = new URL(request.url);
  const lessonId = url.searchParams.get('lesson_id');

  if (lessonId) {
    const row = await env.DB.prepare(
      'SELECT * FROM progreso_lecciones WHERE user_id = ? AND lesson_id = ? LIMIT 1'
    ).bind(data.user.id, lessonId).first();

    if (!row) return Response.json(null);
    return Response.json(parseLessonProgressRow(row));
  }

  // Devolver todo el progreso de lecciones del usuario
  const { results } = await env.DB.prepare(
    'SELECT * FROM progreso_lecciones WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(data.user.id).all();

  return Response.json((results || []).map(parseLessonProgressRow));
}

export async function onRequestPost({ request, env, data }) {
  await ensureLessonProgressSchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const lessonId = body.lesson_id;
  const status = body.status || 'completed';
  const progress = typeof body.progress === 'number' ? body.progress : 100;
  const completedAt = body.completed_at || (status === 'completed' ? new Date().toISOString() : null);

  if (!lessonId) {
    return Response.json({ error: 'Falta lesson_id' }, { status: 400 });
  }

  const userId = data.user.id;

  // Insertar o actualizar registro de progreso de la lección
  await env.DB.prepare(`
    INSERT INTO progreso_lecciones (user_id, lesson_id, status, progress, completed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      status = excluded.status,
      progress = excluded.progress,
      completed_at = COALESCE(excluded.completed_at, progreso_lecciones.completed_at),
      updated_at = datetime('now')
  `).bind(userId, lessonId, status, progress, completedAt).run();

  // Actualizar tabla agregada progreso_usuario (conteo total de lecciones completadas)
  try {
    const countRow = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM progreso_lecciones WHERE user_id = ? AND status = 'completed'"
    ).bind(userId).first();

    const completedCount = countRow?.count || 0;

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS progreso_usuario (
        user_id TEXT PRIMARY KEY,
        data TEXT
      )
    `).run();

    const userProgRow = await env.DB.prepare(
      'SELECT data FROM progreso_usuario WHERE user_id = ?'
    ).bind(userId).first();

    let progData = { overall_progress: 0, streak_days: 1, total_hours: 0, lessons_completed: 0 };
    if (userProgRow?.data) {
      try {
        progData = { ...progData, ...JSON.parse(userProgRow.data) };
      } catch {
        /* parse error fallback */
      }
    }

    progData.lessons_completed = completedCount;
    progData.overall_progress = Math.min(100, Math.round((completedCount / 30) * 100)); // cálculo estimado

    await env.DB.prepare(`
      INSERT INTO progreso_usuario (user_id, data)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data
    `).bind(userId, JSON.stringify(progData)).run();

  } catch (err) {
    console.error('Error updating progreso_usuario:', err);
  }

  return Response.json({
    success: true,
    user_id: userId,
    lesson_id: lessonId,
    status,
    progress,
    completed_at: completedAt
  });
}

// ── Helpers de Base de Datos ──────────────────────────────────────────────────

async function ensureLessonProgressSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_lecciones (
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      status TEXT DEFAULT 'in_progress',
      progress INTEGER DEFAULT 0,
      completed_at TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, lesson_id)
    )
  `).run();
}

function parseLessonProgressRow(row) {
  return {
    user_id: row.user_id,
    lesson_id: row.lesson_id,
    status: row.status,
    progress: row.progress,
    completed_at: row.completed_at,
    updated_at: row.updated_at
  };
}
