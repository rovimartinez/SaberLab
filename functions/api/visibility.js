export async function onRequestGet({ env }) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS visibilidad_curso (
      course_id INTEGER PRIMARY KEY,
      lecciones TEXT
    )
  `).run();

  const { results } = await env.DB.prepare(
    'SELECT course_id, lecciones FROM visibilidad_curso'
  ).all();

  const visibilityMap = {};
  results.forEach((row) => {
    try {
      visibilityMap[row.course_id] = JSON.parse(row.lecciones) || {};
    } catch {
      visibilityMap[row.course_id] = {};
    }
  });

  return Response.json(visibilityMap);
}

export async function onRequestPost({ request, env, data }) {
  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { course_id, lecciones } = body;
  if (!course_id) {
    return Response.json({ error: 'Falta course_id' }, { status: 400 });
  }

  await env.DB.prepare(
    `INSERT INTO visibilidad_curso (course_id, lecciones)
     VALUES (?, ?)
     ON CONFLICT (course_id) DO UPDATE SET lecciones = excluded.lecciones`
  ).bind(course_id, JSON.stringify(lecciones ?? {})).run();

  return Response.json({ success: true });
}
