export async function onRequestGet({ request, env, data }) {
  await ensureGroupsSchema(env);

  const url = new URL(request.url);
  const courseId = url.searchParams.get('course_id');
  const groupId = url.searchParams.get('group_id');

  if (groupId) {
    const { results } = await env.DB.prepare(
      `SELECT p.id, p.email, p.full_name
       FROM grupos_usuario gu
       JOIN perfiles p ON p.id = gu.user_id
       WHERE gu.group_id = ?`
    ).bind(groupId).all();

    return Response.json(results);
  }

  if (courseId) {
    const { results } = await env.DB.prepare(
      `SELECT g.id, g.course_id, g.name, g.teacher, COUNT(gu.user_id) AS studentCount
       FROM grupos g
       LEFT JOIN grupos_usuario gu ON gu.group_id = g.id
       WHERE g.course_id = ?
       GROUP BY g.id` 
    ).bind(courseId).all();

    return Response.json(results);
  }

  const { results } = await env.DB.prepare(
    `SELECT g.id, g.course_id, g.name, g.teacher, COUNT(gu.user_id) AS total
     FROM grupos g
     LEFT JOIN grupos_usuario gu ON gu.group_id = g.id
     GROUP BY g.id`
  ).all();

  return Response.json(results);
}

export async function onRequestPost({ request, env, data }) {
  await ensureGroupsSchema(env);

  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, course_id, name, teacher } = body;
  if (!name) {
    return Response.json({ error: 'Falta el nombre del grupo' }, { status: 400 });
  }

  if (id) {
    await env.DB.prepare(
      `UPDATE grupos SET
         name = COALESCE(?, name),
         teacher = COALESCE(?, teacher)
       WHERE id = ?`
    ).bind(name, teacher ?? null, id).run();

    const row = await env.DB.prepare('SELECT * FROM grupos WHERE id = ?').bind(id).first();
    return Response.json(row);
  }

  if (!course_id) {
    return Response.json({ error: 'Falta el course_id' }, { status: 400 });
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO grupos (course_id, name, teacher)
     VALUES (?, ?, ?)`
  ).bind(course_id, name, teacher ?? null).run();

  const row = await env.DB.prepare('SELECT * FROM grupos WHERE id = ?').bind(meta.last_row_id).first();
  return Response.json(row);
}

export async function onRequestPatch({ request, env, data }) {
  await ensureGroupsSchema(env);

  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { group_id, user_id } = body;
  if (!group_id || !user_id) {
    return Response.json({ error: 'Faltan group_id o user_id' }, { status: 400 });
  }

  await env.DB.prepare(
    `DELETE FROM grupos_usuario WHERE group_id = ? AND user_id = ?`
  ).bind(group_id, user_id).run();

  return Response.json({ success: true });
}

export async function onRequestDelete({ request, env, data }) {
  await ensureGroupsSchema(env);

  if (data.user.role !== 'admin') {
    return Response.json({ error: 'Solo administradores' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Falta el id' }, { status: 400 });
  }

  await env.DB.prepare('DELETE FROM grupos_usuario WHERE group_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM grupos WHERE id = ?').bind(id).run();

  return Response.json({ success: true });
}

async function ensureGroupsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      name TEXT NOT NULL,
      teacher TEXT
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();
}
