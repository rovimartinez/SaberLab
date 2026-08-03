export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('origin') || env.APP_URL || 'http://localhost:5173';
  const appUrl = new URL(origin).origin;
  const redirectUri = new URL('/api/auth/callback', appUrl).toString();

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account'
  });

  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
}
