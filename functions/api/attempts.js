async function ensureAttemptsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS intentos_evaluacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      evaluation_key TEXT NOT NULL,
      answers TEXT,
      score INTEGER,
      passed INTEGER,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try {
    await env.DB.prepare(`ALTER TABLE intentos_evaluacion ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`).run();
  } catch {
    // Si la columna ya existe, se ignora
  }
}

export async function onRequestGet({ request, env, data }) {
  await ensureAttemptsSchema(env);
  const url = new URL(request.url);
  const evaluationKey = url.searchParams.get('evaluation_key');

  const isAdmin = ['admin', 'teacher', 'docente', 'profesor'].includes(data?.user?.role) ||
                  (env.ADMIN_EMAIL && data?.user?.email?.toLowerCase() === data?.user?.email?.toLowerCase() && env.ADMIN_EMAIL);

  if (evaluationKey) {
    const fetchAll = url.searchParams.get('all') === 'true';

    // Si es docente/admin y solicita all=true, traer los intentos de todos los estudiantes para esta evaluación
    if (isAdmin && fetchAll) {
      const { results } = await env.DB.prepare(`
        SELECT 
          ie.*,
          COALESCE(p.full_name, ie.user_id) AS student_name,
          p.avatar_url,
          p.email
        FROM intentos_evaluacion ie
        LEFT JOIN perfiles p ON (p.id = ie.user_id OR LOWER(p.email) = LOWER(ie.user_id))
        WHERE ie.evaluation_key = ?
        ORDER BY ie.id DESC
      `).bind(evaluationKey).all();

      return Response.json(results || []);
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? ORDER BY id DESC'
    ).bind(data.user.id, evaluationKey).all();

    // Consultar estado de liberación de calificaciones en la evaluación
    let isReleased = true;
    try {
      const evalRow = await env.DB.prepare('SELECT results_released FROM evaluaciones WHERE evaluation_key = ? LIMIT 1').bind(evaluationKey).first();
      if (evalRow && evalRow.results_released !== null && evalRow.results_released !== undefined) {
        isReleased = evalRow.results_released === 1 || evalRow.results_released === true;
      }
    } catch {
      isReleased = true;
    }

    if (!isAdmin && !isReleased) {
      const masked = (results || []).map(r => ({
        ...r,
        score: null,
        passed: null,
        answers: null,
        results_released: false
      }));
      return Response.json(masked);
    }

    return Response.json(results);
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM intentos_evaluacion WHERE user_id = ? ORDER BY id DESC'
  ).bind(data.user.id).all();
  return Response.json(results);
}

export async function onRequestPost({ request, env, data }) {
  await ensureAttemptsSchema(env);
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { evaluation_key, answers, score, passed, completed_at, points_obtained } = body;
  if (!evaluation_key) {
    return Response.json({ error: 'Falta evaluation_key' }, { status: 400 });
  }

  const answersJson = answers !== undefined ? JSON.stringify(answers) : null;
  const isFinal = completed_at != null;
  const finalScore = typeof points_obtained === 'number' ? points_obtained : (typeof score === 'number' ? score : null);

  // Coincide con la lógica del frontend:
  // - auto-guardado busca el intento incompleto (completed_at IS NULL)
  // - finalizar busca cualquier intento existente
  let existing;
  if (isFinal) {
    existing = await env.DB.prepare(
      'SELECT id FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? ORDER BY id DESC LIMIT 1'
    ).bind(data.user.id, evaluation_key).first();
  } else {
    existing = await env.DB.prepare(
      'SELECT id FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? AND completed_at IS NULL ORDER BY id DESC LIMIT 1'
    ).bind(data.user.id, evaluation_key).first();
  }

  let row;
  if (existing) {
    await env.DB.prepare(
      `UPDATE intentos_evaluacion SET
         answers = COALESCE(?, answers),
         score = COALESCE(?, score),
         passed = COALESCE(?, passed),
         completed_at = COALESCE(?, completed_at)
       WHERE id = ?`
    ).bind(
      answersJson ?? null,
      finalScore,
      typeof passed === 'boolean' ? (passed ? 1 : 0) : null,
      completed_at ?? null,
      existing.id
    ).run();
    row = await env.DB.prepare('SELECT * FROM intentos_evaluacion WHERE id = ?').bind(existing.id).first();
  } else {
    const { meta } = await env.DB.prepare(
      `INSERT INTO intentos_evaluacion (user_id, evaluation_key, answers, score, passed, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      data.user.id,
      evaluation_key,
      answersJson,
      finalScore ?? 0,
      passed ? 1 : 0,
      completed_at ?? null
    ).run();
    row = await env.DB.prepare('SELECT * FROM intentos_evaluacion WHERE id = ?').bind(meta.last_row_id).first();
  }

  const isAdmin = ['admin', 'teacher', 'docente', 'profesor'].includes(data?.user?.role) ||
                  (env.ADMIN_EMAIL && data?.user?.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase());

  if (isFinal && !isAdmin) {
    let isReleased = true;
    try {
      const evalRow = await env.DB.prepare('SELECT results_released FROM evaluaciones WHERE evaluation_key = ? LIMIT 1').bind(evaluation_key).first();
      if (evalRow && evalRow.results_released !== null && evalRow.results_released !== undefined) {
        isReleased = evalRow.results_released === 1 || evalRow.results_released === true;
      }
    } catch {
      isReleased = true;
    }

    if (!isReleased) {
      return Response.json({
        ...row,
        score: null,
        passed: null,
        answers: null,
        results_released: false
      });
    }
  }

  return Response.json(row);
}

export async function onRequestDelete({ request, env, data }) {
  await ensureAttemptsSchema(env);
  const url = new URL(request.url);
  const evaluationKey = url.searchParams.get('evaluation_key');
  const targetUserId = url.searchParams.get('user_id') || data?.user?.id;

  if (!evaluationKey) {
    return Response.json({ error: 'Falta evaluation_key' }, { status: 400 });
  }

  const isAdmin = ['admin', 'teacher', 'docente', 'profesor'].includes(data?.user?.role) ||
                  (env.ADMIN_EMAIL && data?.user?.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase());

  if (!isAdmin && targetUserId !== data?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  await env.DB.prepare(
    'DELETE FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ?'
  ).bind(targetUserId, evaluationKey).run();

  return Response.json({ success: true });
}
