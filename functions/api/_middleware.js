import { verifySession } from './_lib/auth.js';

export async function onRequest(context, next) {
  const user = await verifySession(context.request, context.env);
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  context.data.user = user;
  return next();
}
