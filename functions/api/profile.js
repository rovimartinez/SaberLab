export async function onRequestGet({ env, data }) {
  const userId = data.user.id;

  const profile = await env.DB.prepare(
    `SELECT id, email, full_name, avatar_url, role
     FROM perfiles WHERE id = ?`
  ).bind(userId).first();

  if (!profile) {
    return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  const { results: courses } = await env.DB.prepare(
    `SELECT c.id, c.name, c.abbr, c.slug
     FROM inscripciones i
     JOIN cursos c ON c.id = i.course_id
     WHERE i.user_id = ?`
  ).bind(userId).all();

  return Response.json({ profile, courses });
}
