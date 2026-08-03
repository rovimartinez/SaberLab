export async function onRequestGet({ env, data }) {
  const userId = data.user.id;

  const profile = await env.DB.prepare(
    'SELECT id, email, full_name, avatar_url, role FROM perfiles WHERE id = ?'
  ).bind(userId).first();

  if (!profile) {
    return Response.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  return Response.json({ profile });
}
