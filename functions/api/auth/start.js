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

  // 3. Si APP_URL está definido (variable de entorno de Cloudflare), usarlo siempre en producción.
  //    Esto evita el error redirect_uri_mismatch cuando Cloudflare sirve desde URLs hash
  //    como https://6d66d517.saberlab.pages.dev en vez del dominio canónico registrado en Google.
  if (env.APP_URL && !env.APP_URL.includes('localhost')) {
    return env.APP_URL;
  }

  // 4. En producción (Cloudflare Pages), normalizar el host eliminando URLs de hash de deploy
  const host = forwardedHost || url.hostname;
  const proto = forwardedProto || 'https';
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    // Si es una URL hash de deploy (ej: 6d66d517.saberlab.pages.dev), usar el dominio canónico
    const hashMatch = host.match(/^[0-9a-f]{8}\.(.+)$/);
    if (hashMatch) {
      return `${proto}://${hashMatch[1]}`;
    }
    return `${proto}://${host}`;
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
