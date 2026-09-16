function getBaseAppUrl(request, env) {
  const url = new URL(request.url);
  const referer = request.headers.get('referer');
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // 1. Detectar si estamos en entorno local (Vite + Wrangler)
  const isLocal =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) ||
    (forwardedHost && (forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1'))) ||
    (env.APP_URL && env.APP_URL.includes('localhost'));

  if (isLocal) {
    // En local, Google OAuth SIEMPRE requiere la URL canónica registrada:
    // http://localhost:5173 (NUNCA la IP 127.0.0.1 ni el puerto 8788 interno de Wrangler)
    return 'http://localhost:5173';
  }

  // 2. Si APP_URL está definido en producción (Cloudflare Pages)
  if (env.APP_URL && !env.APP_URL.includes('localhost')) {
    return env.APP_URL;
  }

  // 3. En producción, normalizar si viene de una URL con hash de preview (ej: 6d66d517.saberlab.pages.dev)
  const host = forwardedHost || url.hostname;
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const hashMatch = host.match(/^[0-9a-f]{8}\.(.+)$/);
    if (hashMatch) {
      return `https://${hashMatch[1]}`;
    }
    return `https://${host}`;
  }

  return 'https://saberlab.pages.dev';
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
