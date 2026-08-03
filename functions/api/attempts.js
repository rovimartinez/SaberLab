export async function onRequestPost({ request, env, data }) {
  const userId = data.user.id;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { evaluation_id, respuestas, score } = body;
  if (!evaluation_id || !Array.isArray(respuestas) || typeof score !== 'number') {
    return Response.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const { meta, error } = await env.DB.prepare(
    `INSERT INTO intentos_evaluacion (evaluacion_id, user_id, respuestas, score, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  ).bind(evaluation_id, userId, JSON.stringify(respuestas), score).run();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const intento = await env.DB.prepare(
    `SELECT * FROM intentos_evaluacion WHERE id = ?`
  ).bind(meta.last_row_id).first();

  return Response.json({ id: meta.last_row_id, intento }, { status: 201 });
}
