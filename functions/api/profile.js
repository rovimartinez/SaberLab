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
      `SELECT DISTINCT c.id, c.name, c.abbr, c.slug
       FROM (
         SELECT course_id FROM inscripciones WHERE user_id = ?
         UNION
         SELECT g.course_id FROM grupos_usuario gu
         JOIN grupos g ON g.id = gu.group_id
         WHERE gu.user_id = ?
       ) u_c
       JOIN cursos c ON (c.id = u_c.course_id OR c.abbr = u_c.course_id OR c.slug = u_c.course_id OR CAST(c.id AS TEXT) = CAST(u_c.course_id AS TEXT))
       ORDER BY c.id ASC`
    ).bind(userId, userId).all();

    courses = results || [];
  } catch (err) {
    console.error('Error fetching courses in profile:', err);
  }

  return Response.json({ profile: { ...profile, access_status }, courses });
}
