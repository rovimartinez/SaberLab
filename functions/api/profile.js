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

  // Asegurar tabla inscripciones y cursos
  let courses = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT c.id, c.name, c.abbr, c.slug
       FROM inscripciones i
       JOIN cursos c ON c.id = i.course_id
       WHERE i.user_id = ?`
    ).bind(userId).all();

    courses = results || [];

    // Si es estudiante aprobado y no tiene cursos en inscripciones, auto-inscribir en todos los cursos disponibles
    if (access_status === 'approved' && courses.length === 0) {
      const { results: allAvailableCourses } = await env.DB.prepare('SELECT id, name, abbr, slug FROM cursos').all();
      if (allAvailableCourses && allAvailableCourses.length > 0) {
        for (const c of allAvailableCourses) {
          await env.DB.prepare(
            'INSERT OR IGNORE INTO inscripciones (user_id, course_id) VALUES (?, ?)'
          ).bind(userId, c.id).run();
        }
        courses = allAvailableCourses;
      }
    }
  } catch (err) {
    console.error('Error fetching courses in profile:', err);
  }

  return Response.json({ profile: { ...profile, access_status }, courses });
}
