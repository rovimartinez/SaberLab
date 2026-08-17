// ── API de Progreso y Persistencia de Flashcards (Cloudflare D1) ─────────────

export async function onRequestGet({ request, env, data }) {
  await ensureFlashcardsSchema(env);

  const url = new URL(request.url);
  const lessonId = url.searchParams.get('lesson_id');
  const targetUserId = (data.user.role === 'admin' && url.searchParams.get('user_id')) 
    ? url.searchParams.get('user_id') 
    : data.user.id;

  try {
    let query = 'SELECT * FROM progreso_flashcards WHERE user_id = ?';
    const params = [targetUserId];

    if (lessonId) {
      query += ' AND lesson_id = ?';
      params.push(lessonId);
    }

    query += ' ORDER BY updated_at DESC';

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return Response.json(results || []);
  } catch (err) {
    console.error('Error fetching flashcards progress:', err);
    return Response.json([]);
  }
}

export async function onRequestPost({ request, env, data }) {
  await ensureFlashcardsSchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { lesson_id, card_id, status, mastery_level } = body;

  if (!lesson_id || !card_id || !status) {
    return Response.json({ error: 'Faltan parámetros obligatorios (lesson_id, card_id, status)' }, { status: 400 });
  }

  const userId = data.user.id;
  const isKnown = status === 'known' ? 1 : 0;
  const isUnknown = status === 'unknown' ? 1 : 0;
  const id = `${userId}_${lesson_id}_${card_id}`;

  try {
    await env.DB.prepare(`
      INSERT INTO progreso_flashcards (
        id, user_id, lesson_id, card_id, status, mastery_level, attempts_count, known_count, unknown_count, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'))
      ON CONFLICT(user_id, lesson_id, card_id) DO UPDATE SET
        status = excluded.status,
        mastery_level = excluded.mastery_level,
        attempts_count = progreso_flashcards.attempts_count + 1,
        known_count = progreso_flashcards.known_count + excluded.known_count,
        unknown_count = progreso_flashcards.unknown_count + excluded.unknown_count,
        updated_at = datetime('now')
    `).bind(
      id,
      userId,
      lesson_id,
      card_id,
      status,
      typeof mastery_level === 'number' ? mastery_level : isKnown,
      isKnown,
      isUnknown
    ).run();

    return Response.json({
      success: true,
      card_id,
      status
    });
  } catch (err) {
    console.error('Error saving flashcard state:', err);
    return Response.json({ error: err.message || 'Error guardando estado' }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env, data }) {
  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo el docente o administrador puede reiniciar flashcards' }, { status: 403 });
  }

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get('user_id');
  const lessonId = url.searchParams.get('lesson_id');

  if (!targetUserId) {
    return Response.json({ error: 'Falta user_id del estudiante' }, { status: 400 });
  }

  try {
    if (lessonId) {
      await env.DB.prepare(
        'DELETE FROM progreso_flashcards WHERE user_id = ? AND lesson_id = ?'
      ).bind(targetUserId, lessonId).run();
    } else {
      await env.DB.prepare(
        'DELETE FROM progreso_flashcards WHERE user_id = ?'
      ).bind(targetUserId).run();
    }
    return Response.json({ success: true, message: 'Flashcards reiniciadas por el docente' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function ensureFlashcardsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_flashcards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      status TEXT NOT NULL,
      mastery_level INTEGER DEFAULT 0,
      attempts_count INTEGER DEFAULT 1,
      known_count INTEGER DEFAULT 0,
      unknown_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, lesson_id, card_id)
    )
  `).run();
}
