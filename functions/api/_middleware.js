import { verifySession } from './_lib/auth.js';

const PUBLIC_PATHS = ['/api/auth/start', '/api/auth/callback', '/api/ai/chat'];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isAiChat = url.pathname === '/api/ai/chat';
  if (PUBLIC_PATHS.includes(url.pathname) || (url.pathname === '/api/enrollments/code' && context.request.method === 'GET')) {
    if (isAiChat) {
      const user = await verifySession(context.request, context.env);
      if (user) {
        try {
          const profile = await context.env.DB.prepare(
            'SELECT id, email, full_name, role FROM perfiles WHERE id = ? OR email = ?'
          ).bind(user.id, user.email).first();
          context.data.user = {
            ...user,
            id: profile?.id || user.id,
            email: profile?.email || user.email,
            role: profile?.role || user.role || 'student'
          };
        } catch {
          context.data.user = user;
        }
      }
    }
    return context.next();
  }

  const user = await verifySession(context.request, context.env);
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Consultar rol real y actualizado desde D1
  try {
    const profile = await context.env.DB.prepare(
      'SELECT id, email, full_name, role FROM perfiles WHERE id = ? OR email = ?'
    ).bind(user.id, user.email).first();

    context.data.user = {
      ...user,
      id: profile?.id || user.id,
      email: profile?.email || user.email,
      role: profile?.role || user.role || (context.env.ADMIN_EMAIL && user.email?.toLowerCase() === context.env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student')
    };
  } catch {
    context.data.user = user;
  }

  return context.next();
}
