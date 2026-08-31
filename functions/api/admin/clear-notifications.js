// ── API de Administración: Limpiar TODAS las notificaciones ──────────────────

function checkIsAdmin(data, env) {
  const role = (data?.user?.role || '').toLowerCase();
  const email = (data?.user?.email || '').toLowerCase();
  const adminEmail = (env?.ADMIN_EMAIL || '').toLowerCase();
  return ['admin', 'docente', 'profesor', 'teacher'].includes(role) || (adminEmail && email === adminEmail);
}

export async function onRequest(context) {
  const { request, env, data } = context;

  if (!checkIsAdmin(data, env)) {
    return Response.json({ error: 'Solo administradores o docentes pueden limpiar notificaciones' }, { status: 403 });
  }

  try {
    // 1. Asegurar que la tabla exista para evitar errores
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        title TEXT,
        message TEXT,
        read INTEGER NOT NULL DEFAULT 0,
        sender_name TEXT,
        is_popup INTEGER DEFAULT 1,
        is_temporary INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 8,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    // 2. Eliminar todas las notificaciones
    const result = await env.DB.prepare('DELETE FROM notificaciones').run();
    const count = result?.meta?.changes ?? result?.changes ?? 0;

    return Response.json({
      ok: true,
      success: true,
      deleted: count,
      message: `Se eliminaron las notificaciones de la base de datos (${count} registros).`
    });
  } catch (err) {
    console.error('Error limpiando notificaciones:', err);
    return Response.json({ error: err.message || 'Error al eliminar notificaciones' }, { status: 500 });
  }
}
