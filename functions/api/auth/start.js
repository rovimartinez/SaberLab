function getBaseAppUrl(request, env) {
  const url = new URL(request.url);
  const referer = request.headers.get('referer');
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', ''));

  // 1. Si referer proviene de localhost (desarrollo Vite en puerto 5173 o similar)
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.hostname === 'localhost' || refUrl.hostname === '127.0.0.1') {
        return `${refUrl.protocol}//${refUrl.host}`;
      }
    } catch {}
  }

  // 2. Si la URL actual es localhost / 127.0.0.1
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return `${url.protocol}//${url.host}`;
  }

  // 3. En producción (Cloudflare Pages), usar la URL del host actual
  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (url.origin && !url.origin.includes('localhost') && !url.origin.includes('127.0.0.1')) {
    return url.origin;
  }

  return env.APP_URL || 'http://localhost:5173';
}

export async function onRequestGet({ request, env }) {
  const appUrl = getBaseAppUrl(request, env);
  const redirectUri = new URL('/api/auth/callback', appUrl).toString();

  const url = new URL(request.url);
  const joinCode = (url.searchParams.get('join_code') || url.searchParams.get('code') || '').trim().toUpperCase();

  // Encodear el origen y joinCode en state para que el callback regrese con precisión
  let state = '';
  try {
    state = btoa(JSON.stringify({ appUrl, joinCode, t: Date.now() }));
  } catch {
    state = appUrl;
  }

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state: state
  });

  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
}
