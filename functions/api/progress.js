export async function onRequestGet({ env, data }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS progreso_usuario (
      user_id TEXT PRIMARY KEY,
      data TEXT
    )
  `).run();

  const row = await env.DB.prepare(
    'SELECT data FROM progreso_usuario WHERE user_id = ?'
  ).bind(data.user.id).first();

  if (!row) {
    return Response.json({ overall_progress: 0, streak_days: 0, total_hours: 0, lessons_completed: 0 });
  }

  try {
    const parsed = JSON.parse(row.data || '{}');
    return Response.json(parsed);
  } catch {
    return Response.json({ overall_progress: 0, streak_days: 0, total_hours: 0, lessons_completed: 0 });
  }
}
