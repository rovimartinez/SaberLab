export async function onRequestGet({ request, env, data }) {
  const url = new URL(request.url);
  const evaluationKey = url.searchParams.get('key');
  const id = url.searchParams.get('id');

  await ensureEvaluationsSchema(env);

  if (evaluationKey) {
    const row = await env.DB.prepare(
      'SELECT * FROM evaluaciones WHERE evaluation_key = ? LIMIT 1'
    ).bind(evaluationKey).first();
    if (!row) return Response.json(null);
    return Response.json(parseEvaluationRow(row));
  }

  if (id) {
    const row = await env.DB.prepare('SELECT * FROM evaluaciones WHERE id = ? LIMIT 1').bind(id).first();
    if (!row) return Response.json(null);
    return Response.json(parseEvaluationRow(row));
  }

  const { results } = await env.DB.prepare('SELECT * FROM evaluaciones ORDER BY created_at DESC').all();

  // Si hay usuario logueado, consultar sus intentos para adjuntar status y grade
  let attemptsMap = {};
  if (data?.user?.id) {
    try {
      const { results: attempts } = await env.DB.prepare(
        'SELECT evaluation_key, score, completed_at FROM intentos_evaluacion WHERE user_id = ? ORDER BY id DESC'
      ).bind(data.user.id).all();
      (attempts || []).forEach(att => {
        if (!attemptsMap[att.evaluation_key]) {
          attemptsMap[att.evaluation_key] = att;
        }
      });
    } catch {
      // ignore
    }
  }

  const evaluationsWithStatus = (results || []).map(row => {
    const parsed = parseEvaluationRow(row);
    const attempt = attemptsMap[row.evaluation_key];
    let status = 'pending';
    let grade = null;
    if (attempt) {
      if (attempt.completed_at) {
        status = 'completed';
        grade = attempt.score;
      } else {
        status = 'in_progress';
      }
    }
    return {
      ...parsed,
      status,
      grade
    };
  });

  return Response.json(evaluationsWithStatus);
}

export async function onRequestPost({ request, env }) {
  await ensureEvaluationsSchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, course_id, module_id, evaluation_key, title, description, instructions, questions, time_limit, passing_score, points, is_published, type } = body;
  const questionsText = questions ? JSON.stringify(questions) : null;

  if (id) {
    await env.DB.prepare(
      `UPDATE evaluaciones SET
         course_id = COALESCE(?, course_id),
         module_id = COALESCE(?, module_id),
         evaluation_key = COALESCE(?, evaluation_key),
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         instructions = COALESCE(?, instructions),
         questions = COALESCE(?, questions),
         time_limit = COALESCE(?, time_limit),
         passing_score = COALESCE(?, passing_score),
         points = COALESCE(?, points),
         is_published = COALESCE(?, is_published),
         type = COALESCE(?, type)
       WHERE id = ?`
    ).bind(
      course_id ?? null,
      module_id ?? null,
      evaluation_key ?? null,
      title ?? null,
      description ?? null,
      instructions ?? null,
      questionsText,
      time_limit ?? null,
      passing_score ?? null,
      points ?? null,
      is_published ?? null,
      type ?? null,
      id
    ).run();

    const row = await env.DB.prepare('SELECT * FROM evaluaciones WHERE id = ?').bind(id).first();
    return Response.json(parseEvaluationRow(row));
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO evaluaciones (
       course_id, module_id, evaluation_key, title, description, instructions,
       questions, time_limit, passing_score, points, is_published, type, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    course_id ?? null,
    module_id ?? null,
    evaluation_key ?? null,
    title ?? null,
    description ?? null,
    instructions ?? null,
    questionsText,
    time_limit ?? null,
    passing_score ?? null,
    points ?? null,
    is_published ? 1 : 0,
    type ?? null
  ).run();

  const row = await env.DB.prepare('SELECT * FROM evaluaciones WHERE id = ?').bind(meta.last_row_id).first();
  return Response.json(parseEvaluationRow(row));
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Falta el id' }, { status: 400 });
  }

  await env.DB.prepare('DELETE FROM evaluaciones WHERE id = ?').bind(id).run();
  return Response.json({ success: true });
}

function parseEvaluationRow(row) {
  if (!row) return null;
  return {
    ...row,
    questions: safeParseQuestions(row.questions),
    is_published: row.is_published === 1 || row.is_published === true,
  };
}

function safeParseQuestions(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    let parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function ensureEvaluationsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS evaluaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      module_id INTEGER,
      evaluation_key TEXT,
      title TEXT,
      description TEXT,
      instructions TEXT,
      questions TEXT,
      time_limit INTEGER,
      passing_score INTEGER,
      points INTEGER,
      is_published INTEGER NOT NULL DEFAULT 0,
      type TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  for (const column of ['evaluation_key', 'module_id', 'passing_score', 'points', 'type']) {
    try {
      await env.DB.prepare(`ALTER TABLE evaluaciones ADD COLUMN ${column} TEXT`).run();
    } catch {
      // ignore if column already exists or ALTER not supported
    }
  }
}
