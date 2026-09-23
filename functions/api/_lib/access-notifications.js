// ─────────────────────────────────────────────────────────────────────────────
// SaberLab · Helpers de notificaciones del flujo de SOLICITUDES DE ACCESO
// Escribe en la tabla `notificaciones` de Cloudflare D1 para alimentar la
// campana (`/api/notifications`) y los avisos emergentes en vivo.
// Archivo auxiliar (prefijo `_`): NO se expone como endpoint.
// ─────────────────────────────────────────────────────────────────────────────

export async function ensureNotificationsTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      sender_id TEXT,
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
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN sender_id TEXT').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_temporary INTEGER DEFAULT 0').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN duration INTEGER DEFAULT 8').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_dismissed INTEGER DEFAULT 0').run(); } catch {}
}

// Evita notificaciones duplicadas idénticas para el mismo destinatario
async function notificationExists(env, { userKey, title, message }) {
  try {
    const row = await env.DB.prepare(
      'SELECT id FROM notificaciones WHERE LOWER(user_id) = LOWER(?) AND title = ? AND message = ? LIMIT 1'
    ).bind(String(userKey).toLowerCase(), title, message).first();
    return Boolean(row);
  } catch {
    return false;
  }
}

export async function insertNotification(env, {
  userKey,
  senderName = 'Sistema de Accesos',
  title,
  message,
  isPopup = 1,
  isTemporary = 0,
  duplicateKeys = true
}) {
  await ensureNotificationsTable(env);
  const normalizedKey = String(userKey || '').trim().toLowerCase();
  if (!normalizedKey || !title) return false;

  if (duplicateKeys && (await notificationExists(env, { userKey: normalizedKey, title, message }))) {
    return false;
  }

  try {
    await env.DB.prepare(
      `INSERT INTO notificaciones (user_id, sender_id, title, message, read, sender_name, is_popup, is_temporary, created_at)
       VALUES (?, 'sistema', ?, ?, 0, ?, ?, ?, datetime('now'))`
    ).bind(normalizedKey, title, message, senderName, isPopup ? 1 : 0, isTemporary ? 1 : 0).run();
    return true;
  } catch (err) {
    console.error('Error insertando notificación de acceso:', err);
    return false;
  }
}

// Correos de todos los administradores/directivos registrados (+ ADMIN_EMAIL del entorno)
export async function getAdminEmails(env) {
  const emails = new Set();
  try {
    const { results } = await env.DB.prepare(
      "SELECT email FROM perfiles WHERE LOWER(role) IN ('admin') AND email IS NOT NULL"
    ).all();
    (results || []).forEach((row) => {
      const em = String(row.email || '').trim().toLowerCase();
      if (em) emails.add(em);
    });
  } catch { /* tabla perfiles aún no existe */ }
  const envAdmin = String(env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (envAdmin) emails.add(envAdmin);
  return [...emails];
}

// ── 1) Llegó una nueva solicitud → avisar a admins (gestión vía burbuja de solicitudes) ──
export async function notifyAdminsNewRequest(env, { name, email }) {
  // Las solicitudes de acceso ahora se gestionan de forma 100% independiente
  // a través de la tabla `solicitudes_acceso`, el contador `pendingAccessRequestsCount`
  // y la burbuja flotante `AdminAccessRequestsBubble`, sin contaminar la bandeja de notificaciones académicas.
  return true;
}

// ── 2) Se resolvió la solicitud → notificar al estudiante con bienvenida oficial ──
export async function notifyStudentDecision(env, { email, name, status }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return;
  const displayName = (name || '').trim() || normalizedEmail.split('@')[0];

  let title;
  let message;
  if (status === 'approved') {
    title = '✅ Acceso aprobado';
    message = `¡Bienvenido/a a SaberLab, ${displayName}! 👋 Tu solicitud de acceso fue aprobada. Ya puedes iniciar sesión e ingresar a tus cursos.`;
  } else if (status === 'rejected') {
    title = '⛔ Acceso rechazado';
    message = 'Tu solicitud de acceso fue rechazada. Si consideras que es un error, contacta a tu docente institucional.';
  } else {
    return;
  }

  await insertNotification(env, {
    userKey: normalizedEmail,
    senderName: 'SaberLab Oficial',
    title,
    message,
    isPopup: status === 'approved' ? 1 : 0
  });
}

// ── 3) Confirmación interna de la decisión registrada por el admin ──
export async function notifyAdminDecisionMade(env, { adminEmail, name, email, status }) {
  // No insertamos notificación para el admin para mantener su bandeja de entrada libre de ruido administrativo
  return true;
}