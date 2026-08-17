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
}

export async function onRequestGet({ request, env, data }) {
  await ensureAttemptsSchema(env);
  const url = new URL(request.url);
  const evaluationKey = url.searchParams.get('evaluation_key');

  if (evaluationKey) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM intentos_evaluacion WHERE user_id = ? AND evaluation_key = ? ORDER BY created_at DESC'
    ).bind(data.user.id, evaluationKey).all();
    return Response.json(results);
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM intentos_evaluacion WHERE user_id = ? ORDER BY created_at DESC'
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

  const { evaluation_key, answers, score, passed, completed_at } = body;
  if (!evaluation_key) {
    return Response.json({ error: 'Falta evaluation_key' }, { status: 400 });
  }

  const answersJson = answers !== undefined ? JSON.stringify(answers) : null;
  const isFinal = completed_at != null;

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
      typeof score === 'number' ? score : null,
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
      typeof score === 'number' ? score : 0,
      passed ? 1 : 0,
      completed_at ?? null
    ).run();
    row = await env.DB.prepare('SELECT * FROM intentos_evaluacion WHERE id = ?').bind(meta.last_row_id).first();
  }

  return Response.json(row);
}
