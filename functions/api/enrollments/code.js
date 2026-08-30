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

  // Poblar cursos base si no existen
  await env.DB.prepare(`
    INSERT OR IGNORE INTO cursos (id, name, abbr, slug) VALUES
    (1, 'Electricidad y Electrónica Básica', 'EE', 'electricidad-y-electronica'),
    (2, 'Fundamentos de Programación', 'FP', 'programacion'),
    (3, 'Mediaciones Tecnológicas en la Química', 'MQ', 'quimica-tecnologica'),
    (4, 'Modelado y Animación 3D', 'MA', 'modelado-y-animacion-3d'),
    (5, 'Robótica Educativa', 'RE', 'robotica-educativa'),
    (6, 'Tendencias y Desarrollo en Tecnología', 'TD', 'tendencias-desarrollo')
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
  let group = null;
  if (codeRow.group_id) {
    group = await env.DB.prepare(
      'SELECT * FROM grupos WHERE id = ?'
    ).bind(codeRow.group_id).first();
  }

  if (!group && codeRow.course_id) {
    group = await env.DB.prepare(
      'SELECT * FROM grupos WHERE course_id = ? LIMIT 1'
    ).bind(codeRow.course_id).first();

    if (!group) {
      const { meta } = await env.DB.prepare(
        'INSERT INTO grupos (name, course_id) VALUES (?, ?)'
      ).bind('Grupo General', codeRow.course_id).run();
      group = { id: meta.last_row_id, name: 'Grupo General', course_id: codeRow.course_id };
    }
  }

  if (!group) {
    return Response.json({ error: 'Grupo o curso no encontrado para este código' }, { status: 404 });
  }

  // 3. Buscar el curso asociado (dar prioridad a codeRow.course_id si fue configurado en el enlace)
  const targetCourseId = codeRow.course_id || group.course_id || 1;
  let course = null;
  try {
    course = await env.DB.prepare(
      'SELECT id, name, abbr, slug FROM cursos WHERE id = ? OR abbr = ? OR slug = ? OR CAST(id AS TEXT) = CAST(? AS TEXT)'
    ).bind(targetCourseId, targetCourseId, targetCourseId, targetCourseId).first();
  } catch {}

  const courseId = course?.id || (typeof targetCourseId === 'number' ? targetCourseId : 1);
  const resolvedCourse = course || {
    id: courseId,
    name: (courseId === 5) ? 'Robótica Educativa' : (group.name || 'Electricidad y Electrónica Básica'),
    abbr: (courseId === 5) ? 'RE' : 'EE',
    slug: (courseId === 5) ? 'robotica-educativa' : 'electricidad-y-electronica'
  };

  // 4. Inscribir usuario en el grupo
  await env.DB.prepare(
    'INSERT OR IGNORE INTO grupos_usuario (user_id, group_id) VALUES (?, ?)'
  ).bind(userId, group.id).run();

  // 5. Inscribir usuario en el curso
  await env.DB.prepare(
    'INSERT OR REPLACE INTO inscripciones (user_id, course_id, group_id) VALUES (?, ?, ?)'
  ).bind(userId, courseId, group.id).run();

  // 6. Auto-aprobar al usuario: si se une con enlace o código generado por el docente, queda aprobado directamente
  try {
    await env.DB.prepare(
      "UPDATE perfiles SET access_status = 'approved' WHERE id = ?"
    ).bind(userId).run();

    await env.DB.prepare(
      "UPDATE solicitudes_acceso SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE email = (SELECT email FROM perfiles WHERE id = ?)"
    ).bind(userId).run();
  } catch (approvalErr) {
    console.error('Error auto-approving profile on code redeem:', approvalErr);
  }

  return Response.json({
    success: true,
    curso: resolvedCourse,
    grupo: group
  });
}
