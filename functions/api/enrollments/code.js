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

  // Asegurar columna course_id si falta
  try {
    await env.DB.prepare('ALTER TABLE codigos_grupo ADD COLUMN course_id INTEGER').run();
  } catch {}

  // 1. Buscar código en codigos_grupo (insensible a mayúsculas y guiones)
  const normalizedCleanCode = cleanCode.replace(/\s+/g, '');
  let codeRow = await env.DB.prepare(
    'SELECT * FROM codigos_grupo WHERE UPPER(code) = ? OR REPLACE(UPPER(code), "-", "") = REPLACE(?, "-", "")'
  ).bind(normalizedCleanCode, normalizedCleanCode).first();

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

  // 2. Inferir curso si no viene explícito
  let inferredCourseId = codeRow.course_id;
  const upperCode = (codeRow.code || '').toUpperCase();
  if (!inferredCourseId) {
    if (upperCode.startsWith('RE-') || upperCode.startsWith('RE')) inferredCourseId = 5;
    else if (upperCode.startsWith('EE-') || upperCode.startsWith('EE')) inferredCourseId = 1;
    else if (upperCode.startsWith('FP-') || upperCode.startsWith('FP')) inferredCourseId = 2;
    else if (upperCode.startsWith('MQ-') || upperCode.startsWith('MQ')) inferredCourseId = 3;
    else if (upperCode.startsWith('MA-') || upperCode.startsWith('MA')) inferredCourseId = 4;
    else if (upperCode.startsWith('TD-') || upperCode.startsWith('TD')) inferredCourseId = 6;
  }

  // 3. Buscar o crear el grupo correspondiente
  let group = null;
  if (codeRow.group_id) {
    group = await env.DB.prepare(
      'SELECT * FROM grupos WHERE id = ?'
    ).bind(codeRow.group_id).first();
  }

  const targetCourseId = inferredCourseId || group?.course_id || 1;

  if (!group) {
    group = await env.DB.prepare(
      'SELECT * FROM grupos WHERE course_id = ? LIMIT 1'
    ).bind(targetCourseId).first();

    if (!group) {
      const courseNameFallback = (targetCourseId === 5) ? 'Robótica Educativa' : 'Electricidad y Electrónica';
      const { meta } = await env.DB.prepare(
        'INSERT INTO grupos (name, course_id) VALUES (?, ?)'
      ).bind(`Grupo General - ${courseNameFallback}`, targetCourseId).run();
      group = { id: meta.last_row_id, name: `Grupo General - ${courseNameFallback}`, course_id: targetCourseId };
    }
  }

  // 4. Buscar el curso asociado
  let course = null;
  try {
    course = await env.DB.prepare(
      'SELECT id, name, abbr, slug FROM cursos WHERE id = ? OR abbr = ? OR slug = ? OR CAST(id AS TEXT) = CAST(? AS TEXT)'
    ).bind(targetCourseId, targetCourseId, targetCourseId, targetCourseId).first();
  } catch {}

  const courseId = course?.id || (typeof targetCourseId === 'number' ? targetCourseId : 1);
  const resolvedCourse = course || {
    id: courseId,
    name: (courseId === 5) ? 'Robótica Educativa' : (group?.name || 'Electricidad y Electrónica Básica'),
    abbr: (courseId === 5) ? 'RE' : 'EE',
    slug: (courseId === 5) ? 'robotica-educativa' : 'electricidad-y-electronica'
  };

  // 5. Inscribir usuario en el grupo
  if (group?.id) {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO grupos_usuario (user_id, group_id) VALUES (?, ?)'
    ).bind(userId, group.id).run();
  }

  // 6. Inscribir usuario en el curso
  await env.DB.prepare(
    'INSERT OR REPLACE INTO inscripciones (user_id, course_id, group_id) VALUES (?, ?, ?)'
  ).bind(userId, courseId, group?.id || null).run();

  // 7. Auto-aprobar al usuario: si se une con enlace o código generado por el docente, queda aprobado directamente
  try {
    const userRow = await env.DB.prepare('SELECT email, full_name FROM perfiles WHERE id = ?').bind(userId).first();
    const userEmail = userRow?.email || userId;

    if (userEmail) {
      const existingReq = await env.DB.prepare('SELECT id FROM solicitudes_acceso WHERE lower(email) = ?').bind(userEmail.toLowerCase()).first();
      if (existingReq) {
        await env.DB.prepare("UPDATE solicitudes_acceso SET status = 'approved', reviewed_at = datetime('now') WHERE id = ?").bind(existingReq.id).run();
      } else {
        await env.DB.prepare("INSERT INTO solicitudes_acceso (email, name, status, created_at, reviewed_at) VALUES (?, ?, 'approved', datetime('now'), datetime('now'))").bind(userEmail.toLowerCase(), userRow?.full_name || userEmail).run();
      }
    }

    try {
      await env.DB.prepare("UPDATE perfiles SET access_status = 'approved' WHERE id = ?").bind(userId).run();
    } catch {}
  } catch (approvalErr) {
    console.error('Error auto-approving profile on code redeem:', approvalErr);
  }

  return Response.json({
    success: true,
    curso: resolvedCourse,
    grupo: group
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code || typeof code !== 'string') {
    return Response.json({ valid: false, error: 'missing_code', message: 'Falta el código de invitación' }, { status: 400 });
  }

  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');

  try {
    let codeRow = await env.DB.prepare(`
      SELECT 
        c.id, c.code, c.group_id, c.course_id, c.expires_at, c.created_at,
        g.name as group_name, g.course_id as group_course_id,
        cur.name as course_name, cur.abbr as course_abbr, cur.slug as course_slug
      FROM codigos_grupo c
      LEFT JOIN grupos g ON c.group_id = g.id
      LEFT JOIN cursos cur ON cur.id = COALESCE(c.course_id, g.course_id)
      WHERE UPPER(c.code) = ? OR REPLACE(UPPER(c.code), "-", "") = REPLACE(?, "-", "")
      ORDER BY c.id DESC LIMIT 1
    `).bind(cleanCode, cleanCode).first();

    if (!codeRow) {
      return Response.json({ 
        valid: false, 
        error: 'not_found', 
        message: 'Código o enlace de invitación no encontrado. Verifica con tu docente.' 
      });
    }

    let isExpired = false;
    if (codeRow.expires_at) {
      const exp = new Date(codeRow.expires_at);
      if (!isNaN(exp.getTime()) && exp < new Date()) {
        isExpired = true;
      }
    }

    let resolvedCourseName = codeRow.course_name;
    let resolvedCourseAbbr = codeRow.course_abbr;
    let resolvedCourseId = codeRow.course_id || codeRow.group_course_id;

    if (!resolvedCourseName) {
      const upperCode = (codeRow.code || '').toUpperCase();
      if (upperCode.startsWith('RE-') || upperCode.startsWith('RE')) {
        resolvedCourseName = 'Robótica Educativa';
        resolvedCourseAbbr = 'RE';
        resolvedCourseId = 5;
      } else if (upperCode.startsWith('SIMI-') || upperCode.startsWith('SIMI')) {
        resolvedCourseName = 'Semillero SIMI3D';
        resolvedCourseAbbr = 'SIMI';
        resolvedCourseId = 6;
      } else if (upperCode.startsWith('EE-') || upperCode.startsWith('EE')) {
        resolvedCourseName = 'Electricidad y Electrónica Básica';
        resolvedCourseAbbr = 'EE';
        resolvedCourseId = 1;
      } else {
        resolvedCourseName = codeRow.group_name || 'Curso Asignado';
        resolvedCourseAbbr = 'STEAM';
      }
    }

    if (isExpired) {
      return Response.json({
        valid: false,
        error: 'expired',
        message: 'Este enlace de invitación ha expirado. Pídele a tu docente que amplíe la vigencia.',
        code: codeRow.code,
        group_name: codeRow.group_name || 'Grupo Oficial',
        course_name: resolvedCourseName,
        course_abbr: resolvedCourseAbbr,
        expires_at: codeRow.expires_at
      });
    }

    return Response.json({
      valid: true,
      code: codeRow.code,
      group_id: codeRow.group_id,
      group_name: codeRow.group_name || 'Grupo Oficial',
      course_id: resolvedCourseId,
      course_name: resolvedCourseName,
      course_abbr: resolvedCourseAbbr,
      expires_at: codeRow.expires_at
    });
  } catch (err) {
    return Response.json({ valid: false, error: 'server_error', message: err.message || 'Error al validar código' }, { status: 500 });
  }
}

