export async function onRequestGet({ env, data }) {
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

  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN is_temporary INTEGER DEFAULT 0').run(); } catch {}
  try { await env.DB.prepare('ALTER TABLE notificaciones ADD COLUMN duration INTEGER DEFAULT 8').run(); } catch {}

  const userId = data.user.id;
  const userEmail = (data.user.email || '').toLowerCase();

  // Limpiar mensajes temporales antiguos de más de 10 minutos
  try {
    await env.DB.prepare(`
      DELETE FROM notificaciones 
      WHERE is_temporary = 1 AND datetime(created_at) <= datetime('now', '-10 minutes')
    `).run();
  } catch {}

  // ── Generador automático de notificaciones de examen (10 días, 5 días, 2 días y el día del examen) ──
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayMs = new Date(todayStr).getTime();

    // 1. Obtener exámenes de la base de datos
    let examList = [];
    try {
      const { results: dbExams } = await env.DB.prepare('SELECT title, due_date, evaluation_key FROM evaluaciones').all();
      if (Array.isArray(dbExams)) examList = dbExams;
    } catch {}

    // 2. Evaluaciones oficiales por defecto (EE y RE)
    const defaultExams = [
      { title: 'Examen 1 (Electricidad) - Fundamentos y Circuitos', due_date: '2026-09-02', evaluation_key: 'ee-m1-l6' },
      { title: 'Examen 2 (Electricidad) - Uso de Componentes Electrónicos', due_date: '2026-09-28', evaluation_key: 'ee-m2-l10' },
      { title: 'Examen 3 (Electricidad) - Implementación de Circuitos Integrados', due_date: '2026-10-21', evaluation_key: 'ee-m3-l14' },
      { title: 'Presentación del Proyecto Final (Electricidad)', due_date: '2026-11-11', evaluation_key: 'ee-m4-l16' },
      { title: 'Módulo 1 – Examen 1: Fundamentos y Lógica Digital (Robótica)', due_date: '2026-09-04', evaluation_key: 're-m1-eval' },
      { title: 'Módulo 2 – Examen 2: Sensores y Mundo Físico (Robótica)', due_date: '2026-09-25', evaluation_key: 're-m2-eval' },
      { title: 'Módulo 3 – Examen 3: Movimiento y Actuadores (Robótica)', due_date: '2026-10-27', evaluation_key: 're-m3-eval' },
      { title: 'Módulo 4 – Proyecto Final Integrador (Robótica)', due_date: '2026-11-13', evaluation_key: 're-m4-eval' }
    ];

    const allExams = [...defaultExams];
    examList.forEach(de => {
      if (!allExams.some(e => e.evaluation_key === de.evaluation_key)) {
        allExams.push(de);
      }
    });

    for (const exam of allExams) {
      if (!exam.due_date) continue;
      const examDueDate = exam.due_date.includes('T') ? exam.due_date.split('T')[0] : exam.due_date;
      const examMs = new Date(examDueDate).getTime();
      const diffDays = Math.round((examMs - todayMs) / (1000 * 60 * 60 * 24));

      let reminderTitle = null;
      let reminderMsg = null;

      if (diffDays === 10) {
        reminderTitle = `⏰ Faltan 10 días para: ${exam.title}`;
        reminderMsg = `Te recordamos que en 10 días se llevará a cabo la evaluación oficial. Te recomendamos repasar los conceptos y simuladores con anticipación.`;
      } else if (diffDays === 5) {
        reminderTitle = `📅 Faltan 5 días para: ${exam.title}`;
        reminderMsg = `Faltan solo 5 días para tu examen. Revisa tus tarjetas de estudio y completa los retos prácticos en el simulador.`;
      } else if (diffDays === 2) {
        reminderTitle = `⚠️ ¡Faltan 2 días para tu examen!: ${exam.title}`;
        reminderMsg = `Tu evaluación oficial será en 2 días. Asegúrate de tener listos todos tus conceptos y resolver dudas con tu docente.`;
      } else if (diffDays === 0) {
        reminderTitle = `🚀 ¡Hoy es el día de tu examen!: ${exam.title}`;
        reminderMsg = `¡Hoy es la fecha oficial de tu evaluación! Ingresa al módulo de evaluaciones para realizar tu prueba con total concentración y éxito.`;
      }

      if (reminderTitle && reminderMsg) {
        const existing = await env.DB.prepare(
          'SELECT id FROM notificaciones WHERE (user_id = ? OR LOWER(user_id) = LOWER(?)) AND title = ? LIMIT 1'
        ).bind(userId, userEmail, reminderTitle).first();

        if (!existing) {
          await env.DB.prepare(`
            INSERT INTO notificaciones (user_id, title, message, read, sender_name, is_popup, created_at)
            VALUES (?, ?, ?, 0, 'Sistema Académico', 1, datetime('now'))
          `).bind(userId, reminderTitle, reminderMsg).run();
        }
      }
    }
  } catch (notifErr) {
    console.warn('Aviso generador de notificaciones automáticas:', notifErr);
  }

  // Devolver solo las notificaciones persistentes que NO sean temporales
  const { results } = await env.DB.prepare(`
    SELECT id, title, message, read, sender_name, created_at 
    FROM notificaciones 
    WHERE (user_id = ? OR LOWER(user_id) = LOWER(?))
      AND (is_temporary = 0 OR is_temporary IS NULL)
    ORDER BY created_at DESC
  `).bind(userId, userEmail).all();

  return Response.json(results || []);
}

export async function onRequestPost({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.all) {
    await env.DB.prepare('UPDATE notificaciones SET read = 1 WHERE user_id = ?').bind(data.user.id).run();
    return Response.json({ success: true });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json({ error: 'Faltan ids' }, { status: 400 });
  }

  const placeholders = body.ids.map(() => '?').join(',');
  await env.DB.prepare(
    `UPDATE notificaciones SET read = 1 WHERE user_id = ? AND id IN (${placeholders})`
  ).bind(data.user.id, ...body.ids).run();

  return Response.json({ success: true });
}

export async function onRequestDelete({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.all) {
    await env.DB.prepare('DELETE FROM notificaciones WHERE user_id = ?').bind(data.user.id).run();
    return Response.json({ success: true });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json({ error: 'Faltan ids' }, { status: 400 });
  }

  const placeholders = body.ids.map(() => '?').join(',');
  await env.DB.prepare(
    `DELETE FROM notificaciones WHERE user_id = ? AND id IN (${placeholders})`
  ).bind(data.user.id, ...body.ids).run();

  return Response.json({ success: true });
}
