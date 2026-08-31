// DELETE /api/admin/clear-notifications
// Elimina TODAS las notificaciones de todos los estudiantes (solo admin/docente)
export async function onRequestDelete({ env, data }) {
  const role = (data.user?.role || '').toLowerCase();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher'].includes(role);
  if (!isStaff) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { meta } = await env.DB.prepare(
      'DELETE FROM notificaciones'
    ).run();

    return Response.json({
      ok: true,
      deleted: meta?.changes ?? 0,
      message: `Se eliminaron ${meta?.changes ?? 0} notificaciones de todos los estudiantes.`
    });
  } catch (err) {
    console.error('Error limpiando notificaciones:', err);
    return Response.json({ error: 'Error al eliminar notificaciones' }, { status: 500 });
  }
}
