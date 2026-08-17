import { createSessionToken } from '../_lib/auth.js';

function getBaseAppUrl(request, env) {
  const url = new URL(request.url);
  const referer = request.headers.get('referer');
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', ''));

  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.hostname === 'localhost' || refUrl.hostname === '127.0.0.1') {
        return `${refUrl.protocol}//${refUrl.host}`;
      }
    } catch {}
  }

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return `${url.protocol}//${url.host}`;
  }

  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (url.origin && !url.origin.includes('localhost') && !url.origin.includes('127.0.0.1')) {
    return url.origin;
  }

  return env.APP_URL || 'http://localhost:5173';
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const rawState = url.searchParams.get('state');

  // Recuperar el origen exacto desde state o fallback
  let appUrl = getBaseAppUrl(request, env);
  if (rawState) {
    try {
      const parsedState = JSON.parse(atob(rawState));
      if (parsedState?.appUrl) {
        appUrl = parsedState.appUrl;
      }
    } catch {
      if (rawState.startsWith('http')) {
        appUrl = rawState;
      }
    }
  }

  const redirectUri = new URL('/api/auth/callback', appUrl).toString();

  if (error) {
    return Response.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`, 302);
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
      return new Response(`OAuth token exchange failed: ${errorMessage}. Redirect URI was: ${redirectUri}`, { status: 500 });
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

    // 3. Asegurar que la tabla de perfiles existe en D1
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
    } else if (email === (env.ADMIN_EMAIL || '').toLowerCase() && profile.role !== 'admin') {
      await env.DB.prepare("UPDATE perfiles SET role = 'admin' WHERE id = ?").bind(userId).run();
      profile.role = 'admin';
    }

    // 5. Emitir nuestro token de sesión JWT
    const token = await createSessionToken(profile, env);

    // 6. Redirigir al panel con el token en el hash
    return Response.redirect(`${appUrl}/dashboard#token=${encodeURIComponent(token)}`, 302);
  } catch (err) {
    return new Response(`Auth callback error: ${err.message || err}`, { status: 500 });
  }
}
