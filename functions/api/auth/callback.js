import { createSessionToken } from '../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return Response.redirect(`${env.APP_URL}/login?error=${error}`, 302);
  }

  if (!code) {
    return Response.redirect(`${env.APP_URL}/login?error=missing_code`, 302);
  }

  const redirectUri = `${env.APP_URL}/api/auth/callback`;

  // 1. Intercambiar el código por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return Response.redirect(`${env.APP_URL}/login?error=token_exchange`, 302);
  }

  // 2. Obtener datos del usuario de Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const googleUser = await userRes.json();

  const email = (googleUser.email || '').toLowerCase();
  if (!email) {
    return Response.redirect(`${env.APP_URL}/login?error=no_email`, 302);
  }

  // 3. Buscar o crear el usuario en D1
  const userId = googleUser.id || email;
  let profile = await env.DB.prepare(
    'SELECT id, email, full_name, avatar_url, role FROM perfiles WHERE id = ?'
  ).bind(userId).first();

  if (!profile) {
    const role = email === (env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'student';
    await env.DB.prepare(
      `INSERT INTO perfiles (id, email, full_name, avatar_url, role, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(userId, email, googleUser.name || null, googleUser.picture || null, role).run();
    profile = { id: userId, email, full_name: googleUser.name || null, avatar_url: googleUser.picture || null, role };
  }

  // 4. Emitir nuestro token de sesión
  const token = await createSessionToken(profile, env);

  // 5. Redirigir a la app con el token (en el hash, para no exponerlo)
  return Response.redirect(`${env.APP_URL}/#/auth?token=${token}`, 302);
}
