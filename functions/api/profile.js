export async function onRequestGet({ env, data }) {
  const userId = data.user.id;

  const profile = await env.DB.prepare(
    `SELECT id, email, full_name, avatar_url, role
     FROM perfiles WHERE id = ?`
  ).bind(userId).first();

  if (!profile) {
    return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  const isAdmin = profile.role === 'admin' || (env.ADMIN_EMAIL && profile.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase());
  let access_status = 'approved';

  if (!isAdmin) {
    const req = await env.DB.prepare(
      'SELECT status FROM solicitudes_acceso WHERE lower(email) = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(profile.email.toLowerCase()).first();
    access_status = req?.status || 'pending';
  }

  // Asegurar tabla cursos creada y poblada
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbr TEXT,
      slug TEXT UNIQUE
    )
  `).run();

  await env.DB.prepare(`
    INSERT OR IGNORE INTO cursos (id, name, abbr, slug) VALUES
    (1, 'Electricidad y Electrónica Básica', 'EE', 'electricidad-y-electronica'),
    (2, 'Fundamentos de Programación', 'FP', 'programacion'),
    (3, 'Mediaciones Tecnológicas en la Química', 'MQ', 'quimica-tecnologica'),
    (4, 'Modelado y Animación 3D', 'MA', 'modelado-y-animacion-3d'),
    (5, 'Robótica Educativa', 'RE', 'robotica-educativa'),
    (6, 'Tendencias y Desarrollo en Tecnología', 'TD', 'tendencias-desarrollo')
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS inscripciones (
      user_id TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      group_id INTEGER,
      PRIMARY KEY (user_id, course_id)
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();

  // Consultar cursos en los que el usuario está inscrito (desde inscripciones y/o grupos_usuario)
  let courses = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT DISTINCT 
         COALESCE(c.id, u_c.course_id) AS id,
         COALESCE(c.name, CASE u_c.course_id 
           WHEN 1 THEN 'Electricidad y Electrónica Básica'
           WHEN 2 THEN 'Fundamentos de Programación'
           WHEN 3 THEN 'Mediaciones Tecnológicas en la Química'
           WHEN 4 THEN 'Modelado y Animación 3D'
           WHEN 5 THEN 'Robótica Educativa'
           WHEN 6 THEN 'Tendencias y Desarrollo en Tecnología'
           ELSE 'Curso Asignado' END) AS name,
         COALESCE(c.abbr, CASE u_c.course_id 
           WHEN 1 THEN 'EE' WHEN 2 THEN 'FP' WHEN 3 THEN 'MQ' WHEN 4 THEN 'MA' WHEN 5 THEN 'RE' WHEN 6 THEN 'TD' 
           ELSE 'SL' END) AS abbr,
         COALESCE(c.slug, CASE u_c.course_id 
           WHEN 1 THEN 'electricidad-y-electronica'
           WHEN 2 THEN 'programacion'
           WHEN 3 THEN 'quimica-tecnologica'
           WHEN 4 THEN 'modelado-y-animacion-3d'
           WHEN 5 THEN 'robotica-educativa'
           WHEN 6 THEN 'tendencias-desarrollo'
           ELSE 'curso' END) AS slug
       FROM (
         SELECT course_id FROM inscripciones WHERE user_id = ?
         UNION
         SELECT g.course_id FROM grupos_usuario gu
         JOIN grupos g ON g.id = gu.group_id
         WHERE gu.user_id = ?
       ) u_c
       LEFT JOIN cursos c ON (c.id = u_c.course_id OR c.abbr = u_c.course_id OR c.slug = u_c.course_id OR CAST(c.id AS TEXT) = CAST(u_c.course_id AS TEXT))
       ORDER BY id ASC`
    ).bind(userId, userId).all();

    courses = results || [];
  } catch (err) {
    console.error('Error fetching courses in profile:', err);
  }

  return Response.json({ profile: { ...profile, access_status }, courses });
}

export async function onRequestPut({ env, data, request }) {
  const userId = data.user?.id;
  if (!userId) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fullName = (body.full_name || '').trim();
    if (!fullName) {
      return Response.json({ error: 'El nombre no puede estar vacío' }, { status: 400 });
    }

    await env.DB.prepare(
      'UPDATE perfiles SET full_name = ? WHERE id = ?'
    ).bind(fullName, userId).run();

    return Response.json({ success: true, full_name: fullName });
  } catch (err) {
    return Response.json({ error: err.message || 'Error al actualizar perfil' }, { status: 500 });
  }
}
