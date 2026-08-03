import { verifySession } from './_lib/auth.js';

const PUBLIC_PATHS = ['/api/auth/start', '/api/auth/callback'];

export async function onRequest(context, next) {
  const url = new URL(context.request.url);
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const user = await verifySession(context.request, context.env);
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  context.data.user = user;
  return next();
}
