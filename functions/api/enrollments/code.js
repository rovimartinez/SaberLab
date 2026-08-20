export async function onRequestPost({ request, env, data }) {
  const userId = data.user?.id;
  if (!userId) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { code } = body;
  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'Falta el código de acceso' }, { status: 400 });
  }

  const cleanCode = code.trim().toUpperCase();

  // Asegurar tablas necesarias
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS codigos_grupo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      code TEXT UNIQUE NOT NULL,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

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

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbr TEXT,
      slug TEXT UNIQUE
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS inscripciones (
      user_id TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      group_id INTEGER,
      PRIMARY KEY (user_id, course_id)
    )
  `).run();

  // 1. Buscar código en codigos_grupo
  const codeRow = await env.DB.prepare(
    'SELECT * FROM codigos_grupo WHERE UPPER(code) = ?'
  ).bind(cleanCode).first();

  if (!codeRow) {
    return Response.json({ error: 'Código inválido o no encontrado' }, { status: 404 });
  }

  // Verificar expiración
  if (codeRow.expires_at) {
    const expiresDate = new Date(codeRow.expires_at);
    if (!isNaN(expiresDate.getTime()) && expiresDate < new Date()) {
      return Response.json({ error: 'Este código ha expirado' }, { status: 400 });
    }
  }

  // 2. Buscar el grupo correspondiente
  const group = await env.DB.prepare(
    'SELECT * FROM grupos WHERE id = ?'
  ).bind(codeRow.group_id).first();

  if (!group) {
    return Response.json({ error: 'Grupo no encontrado para este código' }, { status: 404 });
  }

  // 3. Buscar el curso asociado
  let course = null;
  if (group.course_id) {
    course = await env.DB.prepare(
      'SELECT id, name, abbr, slug FROM cursos WHERE id = ? OR abbr = ? OR slug = ?'
    ).bind(group.course_id, group.course_id, group.course_id).first();
  }

  const courseId = course?.id || group.course_id || 1;

  // 4. Inscribir usuario en el grupo
  await env.DB.prepare(
    'INSERT OR IGNORE INTO grupos_usuario (user_id, group_id) VALUES (?, ?)'
  ).bind(userId, group.id).run();

  // 5. Inscribir usuario en el curso
  await env.DB.prepare(
    'INSERT OR REPLACE INTO inscripciones (user_id, course_id, group_id) VALUES (?, ?, ?)'
  ).bind(userId, courseId, group.id).run();

  if (!course) {
    course = {
      id: courseId,
      name: group.name || 'Curso Asignado',
      abbr: 'EE',
      slug: 'electricidad-y-electronica'
    };
  }

  return Response.json({
    success: true,
    curso: course,
    grupo: group
  });
}
