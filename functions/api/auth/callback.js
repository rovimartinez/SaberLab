import { createSessionToken } from '../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const appUrl = env.APP_URL || request.headers.get('origin') || 'http://localhost:5173';
  const redirectUri = new URL('/api/auth/callback', appUrl).toString();

  if (error) {
    return Response.redirect(`${appUrl}/login?error=${error}`, 302);
  }

  if (!code) {
    return Response.redirect(`${appUrl}/login?error=missing_code`, 302);
  }

  try {
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
    if (!tokenRes.ok || !tokens.access_token) {
      const errorMessage = tokens.error_description || tokens.error || 'Token exchange failed';
      return new Response(`OAuth token exchange failed: ${errorMessage}`, { status: 500 });
    }

    // 2. Obtener datos del usuario de Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      return new Response(`Google userinfo fetch failed: ${userRes.status} ${userRes.statusText} - ${errorText}`, { status: 500 });
    }

    const googleUser = await userRes.json();

    const email = (googleUser.email || '').toLowerCase();
    if (!email) {
      return Response.redirect(`${appUrl}/login?error=no_email`, 302);
    }

    // 3. Asegurar que la tabla de perfiles existe en D1 antes de usarla.
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS perfiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    // 4. Buscar o crear el usuario en D1
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

    // 5. Redirigir al panel con el token en el hash para que no viaje al servidor
    return Response.redirect(`${appUrl}/dashboard#token=${encodeURIComponent(token)}`, 302);
  } catch (err) {
    return new Response(`Auth callback error: ${err.message || err}`, { status: 500 });
  }
}
