// ── API de Analíticas de Práctica, Retos y Simuladores (Cloudflare D1) ──────────

export async function onRequestGet({ request, env, data }) {
  await ensurePracticeSchema(env);

  const url = new URL(request.url);
  const lessonId = url.searchParams.get('lesson_id');
  const targetUserId = (data.user.role === 'admin' && url.searchParams.get('user_id')) 
    ? url.searchParams.get('user_id') 
    : data.user.id;

  try {
    // 1. Obtener progreso en retos de práctica
    let query = 'SELECT * FROM progreso_retos_practica WHERE user_id = ?';
    const params = [targetUserId];
    if (lessonId) {
      query += ' AND lesson_id = ?';
      params.push(lessonId);
    }
    const { results: challenges } = await env.DB.prepare(query).bind(...params).all();

    // 2. Obtener uso de simuladores
    const { results: simulators } = await env.DB.prepare(
      'SELECT * FROM uso_simuladores WHERE user_id = ?'
    ).bind(targetUserId).all();

    // 3. Generar recomendaciones de repaso automáticas
    const weakConcepts = [];
    (challenges || []).forEach(ch => {
      if (ch.failures_count >= 2 || (ch.attempts_count > 1 && !ch.first_try_success)) {
        weakConcepts.push({
          exercise_id: ch.exercise_id,
          exercise_title: ch.exercise_title,
          concept: ch.concept,
          failures: ch.failures_count,
          attempts: ch.attempts_count
        });
      }
    });

    return Response.json({
      challenges: challenges || [],
      simulators: simulators || [],
      recommendations: weakConcepts
    });
  } catch (err) {
    console.error('Error obteniendo analíticas de práctica:', err);
    return Response.json({ challenges: [], simulators: [], recommendations: [] });
  }
}

export async function onRequestPost({ request, env, data }) {
  await ensurePracticeSchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const userId = data.user.id;
  const type = body.type; // 'challenge_attempt' | 'simulator_interaction'

  if (type === 'challenge_attempt') {
    const { lesson_id, exercise_id, exercise_title, concept, is_correct, user_input } = body;
    if (!lesson_id || exercise_id === undefined) {
      return Response.json({ error: 'Faltan parámetros de reto' }, { status: 400 });
    }

    const id = `${userId}_${lesson_id}_${exercise_id}`;
    const isCorrect = is_correct ? 1 : 0;
    const isFailure = is_correct ? 0 : 1;

    try {
      await env.DB.prepare(`
        INSERT INTO progreso_retos_practica (
          id, user_id, lesson_id, exercise_id, exercise_title, concept, status, attempts_count, failures_count, first_try_success, user_last_input, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, datetime('now')
        )
        ON CONFLICT(user_id, lesson_id, exercise_id) DO UPDATE SET
          status = CASE WHEN excluded.status = 'completed' THEN 'completed' ELSE progreso_retos_practica.status END,
          attempts_count = progreso_retos_practica.attempts_count + 1,
          failures_count = progreso_retos_practica.failures_count + excluded.failures_count,
          user_last_input = excluded.user_last_input,
          updated_at = datetime('now')
      `).bind(
        id,
        userId,
        lesson_id,
        String(exercise_id),
        exercise_title || `Reto ${exercise_id}`,
        concept || 'general',
        is_correct ? 'completed' : 'failed',
        isFailure,
        isCorrect, // first_try_success si en el 1er intento es correcto
        String(user_input || '')
      ).run();

      return Response.json({ success: true, is_correct });
    } catch (err) {
      console.error('Error guardando intento de reto:', err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (type === 'simulator_interaction') {
    const { simulator_id, lesson_id, duration_seconds } = body;
    if (!simulator_id) {
      return Response.json({ error: 'Falta simulator_id' }, { status: 400 });
    }

    const id = `${userId}_${simulator_id}`;
    const duration = typeof duration_seconds === 'number' ? duration_seconds : 1;

    try {
      await env.DB.prepare(`
        INSERT INTO uso_simuladores (
          id, user_id, simulator_id, lesson_id, interactions_count, total_time_seconds, last_used_at
        ) VALUES (
          ?, ?, ?, ?, 1, ?, datetime('now')
        )
        ON CONFLICT(user_id, simulator_id) DO UPDATE SET
          interactions_count = uso_simuladores.interactions_count + 1,
          total_time_seconds = uso_simuladores.total_time_seconds + excluded.total_time_seconds,
          last_used_at = datetime('now')
      `).bind(
        id,
        userId,
        simulator_id,
        lesson_id || null,
        duration
      ).run();

      return Response.json({ success: true });
    } catch (err) {
      console.error('Error guardando uso de simulador:', err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ error: 'Tipo no soportado' }, { status: 400 });
}

export async function onRequestDelete({ request, env, data }) {
  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo el docente o administrador puede reiniciar el progreso de práctica' }, { status: 403 });
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
        'DELETE FROM progreso_retos_practica WHERE user_id = ? AND lesson_id = ?'
      ).bind(targetUserId, lessonId).run();
    } else {
      await env.DB.prepare(
        'DELETE FROM progreso_retos_practica WHERE user_id = ?'
      ).bind(targetUserId).run();
    }

    return Response.json({ success: true, message: 'Progreso de retos reiniciado por el docente' });
  } catch (err) {
    console.error('Error reiniciando retos:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function ensurePracticeSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_retos_practica (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_title TEXT,
      concept TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress',
      attempts_count INTEGER DEFAULT 1,
      failures_count INTEGER DEFAULT 0,
      first_try_success INTEGER DEFAULT 0,
      user_last_input TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, lesson_id, exercise_id)
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS uso_simuladores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      simulator_id TEXT NOT NULL,
      lesson_id TEXT,
      interactions_count INTEGER DEFAULT 1,
      total_time_seconds INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      last_used_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, simulator_id)
    )
  `).run();
}
