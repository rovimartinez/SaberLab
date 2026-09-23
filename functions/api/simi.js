// ── API Integral de SIMI3D (Cloudflare D1) ──────────────────────────────────
// Manejo de Eventos (Visitas/Capacitaciones), Asistencias, Proyectos, Recursos e Insignias

export async function onRequestGet({ env, data }) {
  const userId = data?.user?.id || data?.user?.email || 'guest';
  const directorEmail = (env.ADMIN_EMAIL || 'rovimartinez@gmail.com').toLowerCase();
  const role = (data?.user?.role || '').toLowerCase();
  const userEmail = (data?.user?.email || '').toLowerCase();
  const isLeaderOrStaff = ['admin', 'docente', 'profesor', 'teacher', 'leader', 'lider'].includes(role) || (userEmail && userEmail === directorEmail);

  if (!env?.DB) {
    return Response.json({
      success: true,
      events: [],
      projects: [],
      resources: [],
      webResources: [],
      services: [],
      badgeMap: {},
      members: [],
      isLeaderOrStaff
    });
  }

  try {
    await ensureSimiSchema(env);
    // Ejecutar todas las consultas en paralelo con Promise.all (velocidad < 30ms)
    const [eventsRes, attendancesRes, projectsRes, resourcesRes, userBadgesRes, allBadgesRes, membersRes, webResourcesRes, catalogImagesRes, servicesRes, activeSessionRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM simi_eventos ORDER BY date ASC, created_at DESC').all(),
      env.DB.prepare('SELECT * FROM simi_asistencias').all(),
      env.DB.prepare('SELECT * FROM simi_proyectos ORDER BY created_at DESC').all(),
      env.DB.prepare('SELECT * FROM simi_recursos ORDER BY created_at DESC').all(),
      env.DB.prepare('SELECT pin_id, tier, exp_earned FROM simi_insignias WHERE user_id = ?').bind(userId).all(),
      env.DB.prepare('SELECT user_id, pin_id, tier, exp_earned, updated_at FROM simi_insignias').all(),
      env.DB.prepare(`
        SELECT DISTINCT 
          p.id, 
          p.email, 
          p.full_name, 
          p.avatar_url, 
          p.role, 
          p.created_at,
          COALESCE(g.name, CASE WHEN LOWER(p.email) = LOWER(?) THEN 'Dirección I+D' WHEN p.role IN ('leader', 'lider') THEN 'Líder Semillero' ELSE 'Semillero SIMI3D' END) AS group_name
        FROM perfiles p
        INNER JOIN (
          SELECT user_id, group_id FROM grupos_usuario WHERE group_id IN (SELECT id FROM grupos WHERE course_id = 6 OR LOWER(name) LIKE '%simi%' OR LOWER(name) LIKE '%semillero%')
          UNION
          SELECT user_id, group_id FROM inscripciones WHERE course_id = 6 OR group_id IN (SELECT id FROM grupos WHERE course_id = 6 OR LOWER(name) LIKE '%simi%' OR LOWER(name) LIKE '%semillero%')
        ) gu ON (gu.user_id = p.id OR LOWER(gu.user_id) = LOWER(p.email))
        LEFT JOIN grupos g ON g.id = gu.group_id
        UNION
        SELECT DISTINCT 
          p.id, 
          p.email, 
          p.full_name, 
          p.avatar_url, 
          p.role, 
          p.created_at,
          'Dirección I+D' AS group_name
        FROM perfiles p
        WHERE LOWER(p.email) = LOWER(?)
        ORDER BY 
          CASE 
            WHEN LOWER(email) = LOWER(?) THEN 1
            WHEN role IN ('leader', 'lider') THEN 2
            ELSE 3
          END, full_name ASC
      `).bind(directorEmail, directorEmail, directorEmail).all(),
      env.DB.prepare('SELECT * FROM simi_web_recursos ORDER BY created_at ASC').all(),
      env.DB.prepare('SELECT pin_id, badge_image_url FROM simi_catalogo_insignias').all(),
      env.DB.prepare('SELECT * FROM simi_servicios ORDER BY created_at ASC').all().catch(() => ({ results: [] })),
      env.DB.prepare("SELECT * FROM simi_sesion_asistencia WHERE id = 'active_simi_session' AND is_active = 1").first().catch(() => null)
    ]);

    const events = eventsRes?.results || [];
    const attendances = attendancesRes?.results || [];
    const projects = projectsRes?.results || [];
    const resources = resourcesRes?.results || [];
    const userBadges = userBadgesRes?.results || [];
    const allBadges = allBadgesRes?.results || [];
    const rawServices = servicesRes?.results || [];
    let members = membersRes?.results || [];

    // Fallback ultra-rápido si aún no hay miembros o solo está el director
    if (!members || members.length <= 1) {
      try {
        const { results } = await env.DB.prepare(`
          SELECT id, email, full_name, avatar_url, role, created_at, 
                 CASE 
                   WHEN LOWER(email) = LOWER(?) THEN 'Dirección I+D'
                   WHEN role IN ('leader', 'lider') THEN 'Líder Semillero'
                   ELSE 'Semillerista SIMI3D'
                 END AS group_name
          FROM perfiles 
          WHERE role NOT IN ('admin') OR LOWER(email) = LOWER(?)
          ORDER BY 
            CASE WHEN LOWER(email) = LOWER(?) THEN 1 WHEN role IN ('leader', 'lider') THEN 2 ELSE 3 END,
            full_name ASC
        `).bind(directorEmail, directorEmail, directorEmail).all();
        if (results && results.length > 0) {
          members = results;
        }
      } catch {}
    }

    // Mapear asistencias dentro de cada evento y normalizar propiedades camelCase/snake_case
    const eventsWithAttendees = (events || []).map(evt => {
      const allEvtAtt = (attendances || []).filter(a => a.event_id === evt.id);
      
      // Deduplicar asistentes para la lista principal del evento (priorizar el registro maestro ${evt.id}_${userId})
      const uniqueAttendeesMap = new Map();
      allEvtAtt.forEach(a => {
        const uId = a.user_id;
        if (!uId) return;
        if (!uniqueAttendeesMap.has(uId) || a.id === `${evt.id}_${uId}`) {
          uniqueAttendeesMap.set(uId, a);
        }
      });
      const evtAttendees = Array.from(uniqueAttendeesMap.values());

      let parsedEquipment = [];
      if (evt.equipment) {
        try {
          parsedEquipment = typeof evt.equipment === 'string' ? JSON.parse(evt.equipment) : evt.equipment;
        } catch {
          parsedEquipment = String(evt.equipment).split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      const isPrivVal = evt.is_private === 1 || evt.is_private === true;
      const visState = evt.visibility_state || (evt.is_locked === 1 ? 'locked' : evt.is_hidden === 1 ? 'hidden' : 'unlocked');
      
      let parsedSessions = [];
      if (evt.sessions_json) {
        try {
          parsedSessions = typeof evt.sessions_json === 'string' ? JSON.parse(evt.sessions_json) : evt.sessions_json;
        } catch {
          parsedSessions = [];
        }
      }

      // Si no hay sessions_json pero existen asistencias registradas con session_id, reconstruir clases C1, C2...
      if (!Array.isArray(parsedSessions) || parsedSessions.length === 0) {
        const sessionsFoundMap = new Map();
        allEvtAtt.forEach(a => {
          const sId = (a.session_id || 'c1').toLowerCase();
          if (!sessionsFoundMap.has(sId)) {
            const num = sId.replace(/\D/g, '') || '1';
            sessionsFoundMap.set(sId, {
              id: sId,
              name: `C${num}`,
              title: `Clase ${num}`,
              date: a.session_date || evt.date,
              topic: a.session_topic || evt.objective || '',
              attendances: {}
            });
          }
          const sObj = sessionsFoundMap.get(sId);
          if (a.user_id) {
            sObj.attendances[a.user_id] = a.status || (a.attended ? 'asistio' : 'no_vino');
          }
        });
        if (sessionsFoundMap.size > 0) {
          parsedSessions = Array.from(sessionsFoundMap.values());
        }
      }
      return {
        ...evt,
        schoolName: evt.school_name || evt.schoolName || 'Institución Educativa STEAM',
        school_name: evt.school_name || evt.schoolName || 'Institución Educativa STEAM',
        eventType: evt.event_type || evt.eventType || 'visita_escolar',
        event_type: evt.event_type || evt.eventType || 'visita_escolar',
        badgeTier: evt.badge_tier || evt.badgeTier || 'Misión Escolar II',
        badge_tier: evt.badge_tier || evt.badgeTier || 'Misión Escolar II',
        studentsCount: evt.students_count !== undefined ? Number(evt.students_count) : (evt.studentsCount !== undefined ? Number(evt.studentsCount) : 40),
        students_count: evt.students_count !== undefined ? Number(evt.students_count) : (evt.studentsCount !== undefined ? Number(evt.studentsCount) : 40),
        visibilityState: visState,
        visibility_state: visState,
        isLocked: visState === 'locked',
        is_locked: visState === 'locked' ? 1 : 0,
        isHidden: visState === 'hidden',
        is_hidden: visState === 'hidden' ? 1 : 0,
        equipment: parsedEquipment,
        sessions: parsedSessions,
        attendees: evtAttendees.map(a => ({
          userId: a.user_id,
          name: a.user_name,
          status: a.status,
          attended: a.attended === 1,
          attendedWeight: a.attended_weight !== undefined && a.attended_weight !== null 
            ? Number(a.attended_weight) 
            : (a.status === 'asistio' ? 1.0 : (a.status === 'incompleto' ? 0.5 : (a.attended === 1 ? 1.0 : 0.0))),
          updatedAt: a.updated_at
        }))
      };
    });

    // Sesión de asistencia relámpago activa si no ha expirado
    let activeAttendanceSession = null;
    if (activeSessionRes && activeSessionRes.is_active === 1) {
      const now = Date.now();
      const expiresAt = Number(activeSessionRes.expires_at) || 0;
      if (now <= expiresAt + 2000) {
        let parsedOpts = [];
        try { parsedOpts = JSON.parse(activeSessionRes.options_json); } catch {}
        activeAttendanceSession = {
          id: activeSessionRes.id,
          eventId: activeSessionRes.event_id,
          eventTitle: activeSessionRes.event_title,
          eventType: activeSessionRes.event_type,
          targetWord: activeSessionRes.target_word,
          options: parsedOpts,
          familyName: activeSessionRes.family_name,
          durationSeconds: activeSessionRes.duration_seconds,
          startedAt: activeSessionRes.started_at,
          expiresAt: expiresAt,
          remainingSeconds: Math.max(0, Math.ceil((expiresAt - now) / 1000))
        };
      }
    }

    const badgeMap = {};
    (userBadges || []).forEach(b => {
      badgeMap[b.pin_id] = b.tier;
    });

    // Mapa global por usuario para el panel docente
    const memberBadgesMap = {};
    (allBadges || []).forEach(b => {
      if (!memberBadgesMap[b.user_id]) {
        memberBadgesMap[b.user_id] = {};
      }
      memberBadgesMap[b.user_id][b.pin_id] = {
        tier: b.tier,
        exp: b.exp_earned,
        updatedAt: b.updated_at
      };
    });

    const webResources = (webResourcesRes?.results || []).map(r => ({
      id: r.id,
      name: r.name,
      url: r.url,
      host: r.host,
      logoUrl: r.logo_url || null,
      category: r.category,
      tag: r.tag,
      badge: r.badge,
      color: r.color,
      icon: r.icon,
      featured: r.featured === 1,
      description: r.description
    }));

    const catalogImageUrlsMap = {};
    (catalogImagesRes?.results || []).forEach(img => {
      if (img.pin_id && img.badge_image_url) {
        catalogImageUrlsMap[img.pin_id] = img.badge_image_url;
      }
    });

    const parsedProjects = (projects || []).map(p => {
      let assignedMembers = [];
      if (p.assigned_members) {
        try {
          assignedMembers = typeof p.assigned_members === 'string' ? JSON.parse(p.assigned_members) : p.assigned_members;
        } catch {
          assignedMembers = [];
        }
      }
      const isPrivate = p.is_private === 1 || p.isPrivate === true || p.is_private === true;
      return {
        ...p,
        isPrivate,
        is_private: isPrivate ? 1 : 0,
        assignedMembers,
        assigned_members: assignedMembers
      };
    });

    const parsedServices = (rawServices || []).map(s => {
      let features = [];
      if (s.features) {
        try {
          features = typeof s.features === 'string' ? JSON.parse(s.features) : s.features;
        } catch {
          features = [];
        }
      }
      return {
        ...s,
        features: Array.isArray(features) ? features : [],
        isLocked: s.status === 'locked' || s.is_locked === 1,
        isHidden: s.status === 'hidden' || s.is_hidden === 1
      };
    });

    return Response.json({
      success: true,
      events: eventsWithAttendees,
      projects: parsedProjects,
      resources: resources || [],
      webResources: webResources || [],
      services: parsedServices,
      badgeMap,
      memberBadgesMap,
      catalogImageUrlsMap,
      members: members || [],
      activeAttendanceSession,
      isLeaderOrStaff
    });
  } catch (err) {
    console.error('[SIMI API GET Error]', err);
    return Response.json({
      success: true,
      events: [],
      projects: [],
      resources: [],
      webResources: [],
      services: [],
      badgeMap: {},
      members: [],
      isLeaderOrStaff
    });
  }
}

export async function onRequestPost({ request, env, data }) {
  await ensureSimiSchema(env);

  const userId = data?.user?.id || data?.user?.email || 'guest';
  const userEmail = (data?.user?.email || '').toLowerCase();
  const directorEmail = (env.ADMIN_EMAIL || 'rovimartinez@gmail.com').toLowerCase();
  const userName = data?.user?.full_name || data?.user?.name || data?.user?.displayName || 'Semillerista';
  const role = (data?.user?.role || '').toLowerCase();
  const isLeaderOrStaff = ['admin', 'docente', 'profesor', 'teacher', 'leader', 'lider', 'semillero_leader'].includes(role) || (userEmail && userEmail === directorEmail);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { action } = body;

  try {
    // ── 1. REGISTRO DE ASISTENCIA (RSVP / Confirmación del Alumno) ──
    if (action === 'rsvp') {
      const { eventId, status } = body;
      if (!eventId || !status) return Response.json({ error: 'Faltan parámetros' }, { status: 400 });

      const attendanceId = `${eventId}_${userId}`;
      await env.DB.prepare(`
        INSERT INTO simi_asistencias (id, event_id, user_id, user_name, status, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          status = excluded.status,
          user_name = excluded.user_name,
          updated_at = datetime('now')
      `).bind(attendanceId, eventId, userId, userName, status).run();

      return Response.json({ success: true, attendanceId, status });
    }

    // ── 2. VALIDACIÓN DOCENTE DE ASISTENCIA REAL (Asistió 1 / 0) ──
    if (action === 'verify-attendance') {
      if (!isLeaderOrStaff) return Response.json({ error: 'Solo líderes pueden verificar asistencia' }, { status: 403 });
      const { eventId, targetUserId, attended, status: optStatus } = body;
      
      const attendanceId = `${eventId}_${targetUserId}`;
      const attendedVal = attended ? 1 : 0;
      const finalStatus = optStatus || (attendedVal ? 'asistio' : 'no_vino');
      const finalWeight = finalStatus === 'asistio' ? 1.0 : (finalStatus === 'incompleto' ? 0.5 : 0.0);

      await env.DB.prepare(`
        INSERT INTO simi_asistencias (id, event_id, user_id, user_name, status, attended, attended_weight, updated_at)
        VALUES (?, ?, ?, 'Semillerista', ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          status = excluded.status,
          attended = excluded.attended,
          attended_weight = excluded.attended_weight,
          updated_at = datetime('now')
      `).bind(attendanceId, eventId, targetUserId, finalStatus, attendedVal, finalWeight).run();

      return Response.json({ success: true, attended: attendedVal, status: finalStatus, attendedWeight: finalWeight });
    }

    // ── 2B. INICIAR VERIFICACIÓN RELÁMPAGO FLASH (2FA 5-10s) ──
    if (action === 'start-flash-attendance') {
      if (!isLeaderOrStaff) return Response.json({ error: 'Solo líderes o docentes pueden iniciar asistencia relámpago' }, { status: 403 });
      const { 
        eventId, eventTitle = 'Sesión SIMI3D', eventType = 'capacitacion_tecnica',
        targetWord, options = [], familyName = 'Técnica 3D', durationSeconds = 8,
        sessionId = 'c1'
      } = body;

      if (!eventId || !targetWord) return Response.json({ error: 'Falta eventId o targetWord' }, { status: 400 });

      const parsedDuration = Math.min(10, Math.max(5, Number(durationSeconds) || 8));
      const now = Date.now();
      const expiresAt = now + (parsedDuration * 1000);
      const optionsJson = JSON.stringify(options);

      await env.DB.prepare(`
        INSERT INTO simi_sesion_asistencia (
          id, event_id, event_title, event_type, target_word, options_json,
          family_name, duration_seconds, started_at, expires_at, is_active, created_by, session_id, updated_at
        ) VALUES ('active_simi_session', ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, 1, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          event_id = excluded.event_id,
          event_title = excluded.event_title,
          event_type = excluded.event_type,
          target_word = excluded.target_word,
          options_json = excluded.options_json,
          family_name = excluded.family_name,
          duration_seconds = excluded.duration_seconds,
          started_at = datetime('now'),
          expires_at = excluded.expires_at,
          is_active = 1,
          created_by = excluded.created_by,
          session_id = excluded.session_id,
          updated_at = datetime('now')
      `).bind(eventId, eventTitle, eventType, targetWord.toUpperCase(), optionsJson, familyName, parsedDuration, expiresAt, userName, sessionId).run();

      if (body.sessionDate || body.sessionTopic) {
        try {
          if (body.sessionTopic && body.sessionDate) {
            await env.DB.prepare("UPDATE simi_eventos SET objective = ?, date = ?, updated_at = datetime('now') WHERE id = ?")
              .bind(body.sessionTopic, body.sessionDate, eventId).run();
          } else if (body.sessionTopic) {
            await env.DB.prepare("UPDATE simi_eventos SET objective = ?, updated_at = datetime('now') WHERE id = ?")
              .bind(body.sessionTopic, eventId).run();
          } else if (body.sessionDate) {
            await env.DB.prepare("UPDATE simi_eventos SET date = ?, updated_at = datetime('now') WHERE id = ?")
              .bind(body.sessionDate, eventId).run();
          }
        } catch (_) {}
      }

      return Response.json({
        success: true,
        session: {
          id: 'active_simi_session',
          eventId,
          eventTitle,
          eventType,
          targetWord: targetWord.toUpperCase(),
          options,
          familyName,
          durationSeconds: parsedDuration,
          sessionId,
          expiresAt
        }
      });
    }

    // ── 2C. CERRAR SESIÓN RELÁMPAGO FLASH ──
    if (action === 'close-flash-attendance') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      await env.DB.prepare("UPDATE simi_sesion_asistencia SET is_active = 0, updated_at = datetime('now') WHERE id = 'active_simi_session'").run().catch(() => {});
      return Response.json({ success: true });
    }

    // ── 2D. ENVÍO DE RESPUESTA DE ESTUDIANTE A ASISTENCIA FLASH ──
    if (action === 'submit-flash-attendance') {
      const { eventId, selectedWord } = body;
      if (!eventId || !selectedWord) return Response.json({ error: 'Faltan parámetros' }, { status: 400 });

      const session = await env.DB.prepare("SELECT * FROM simi_sesion_asistencia WHERE id = 'active_simi_session' AND is_active = 1").first();
      if (!session) {
        return Response.json({ success: false, error: 'No hay ninguna verificación de asistencia activa o ya concluyó' }, { status: 400 });
      }

      const now = Date.now();
      const expiresAt = Number(session.expires_at) || 0;
      // Margen de gracia de 2.5 segundos para tolerar latencia de red
      if (now > expiresAt + 2500) {
        return Response.json({ success: false, expired: true, message: 'El tiempo límite de verificación ha expirado' }, { status: 400 });
      }

      const isMatch = String(selectedWord).trim().toUpperCase() === String(session.target_word).trim().toUpperCase();
      if (!isMatch) {
        return Response.json({ success: false, correct: false, message: 'Palabra incorrecta. Asistencia no registrada.' });
      }

      const targetSessId = session.session_id || 'c1';
      const sessionAttendanceId = `${eventId}_${targetSessId}_${userId}`;
      const attendanceId = `${eventId}_${userId}`;

      // 1. Guardar asistencia de la sesión específica
      await env.DB.prepare(`
        INSERT INTO simi_asistencias (id, event_id, user_id, user_name, status, attended, attended_weight, session_id, updated_at)
        VALUES (?, ?, ?, ?, 'asistio', 1, 1.0, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          status = 'asistio',
          attended = 1,
          attended_weight = 1.0,
          session_id = excluded.session_id,
          user_name = excluded.user_name,
          updated_at = datetime('now')
      `).bind(sessionAttendanceId, eventId, userId, userName, targetSessId).run();

      // 2. Guardar última asistencia maestra
      await env.DB.prepare(`
        INSERT INTO simi_asistencias (id, event_id, user_id, user_name, status, attended, attended_weight, updated_at)
        VALUES (?, ?, ?, ?, 'asistio', 1, 1.0, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          status = 'asistio',
          attended = 1,
          attended_weight = 1.0,
          user_name = excluded.user_name,
          updated_at = datetime('now')
      `).bind(attendanceId, eventId, userId, userName).run();

      return Response.json({
        success: true,
        correct: true,
        expEarned: 50,
        message: '¡Asistencia Relámpago Confirmada! (+50 EXP)'
      });
    }

    // ── 2E. GUARDADO EN LOTE DE LISTA TRADICIONAL (3 ESTADOS) ──
    if (action === 'batch-save-attendance') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { eventId, sessionId = 'c1', sessionDate, sessionTopic, attendances = [], sessions = [] } = body;
      if (!eventId || !Array.isArray(attendances)) return Response.json({ error: 'Parámetros inválidos' }, { status: 400 });

      const statements = [];
      for (const item of attendances) {
        const targetUserId = item.userId || item.id || item.email;
        if (!targetUserId) continue;
        const targetUserName = item.userName || item.name || item.full_name || 'Semillerista';
        const st = (item.status || 'asistio').toLowerCase();
        const weight = st === 'asistio' ? 1.0 : (st === 'incompleto' ? 0.5 : 0.0);
        const attendedVal = st === 'no_vino' ? 0 : 1;
        const sessionAttendanceId = `${eventId}_${sessionId}_${targetUserId}`;

        // Guardado específico por sesión (C1, C2, C3...)
        statements.push(
          env.DB.prepare(`
            INSERT INTO simi_asistencias (id, event_id, user_id, user_name, status, attended, attended_weight, session_id, session_date, session_topic, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              status = excluded.status,
              attended = excluded.attended,
              attended_weight = excluded.attended_weight,
              user_name = excluded.user_name,
              session_id = excluded.session_id,
              session_date = excluded.session_date,
              session_topic = excluded.session_topic,
              updated_at = datetime('now')
          `).bind(sessionAttendanceId, eventId, targetUserId, targetUserName, st, attendedVal, weight, sessionId, sessionDate, sessionTopic)
        );
      }

      // Registro/actualización de sesiones y metadatos en el evento (UPSERT consolidado en 1 sola sentencia)
      const sessionsStr = Array.isArray(sessions) && sessions.length > 0 ? JSON.stringify(sessions) : null;
      statements.push(
        env.DB.prepare(`
          INSERT INTO simi_eventos (id, school_name, date, objective, sessions_json, updated_at)
          VALUES (?, 'Sesión SIMI3D', COALESCE(?, date('now')), COALESCE(?, 'Bitácora de sesión'), ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            sessions_json = COALESCE(excluded.sessions_json, simi_eventos.sessions_json),
            objective = COALESCE(excluded.objective, simi_eventos.objective),
            date = COALESCE(excluded.date, simi_eventos.date),
            updated_at = datetime('now')
        `).bind(eventId, sessionDate || null, sessionTopic || null, sessionsStr)
      );

      if (statements.length > 0) {
        try {
          await env.DB.batch(statements);
        } catch (batchErr) {
          console.error('[SIMI D1 BATCH ERROR]', batchErr);
        }
      }

      return Response.json({ success: true, count: attendances.length });
    }

    // ── 3. GUARDAR / EDITAR EVENTO (Visita Escolar o Capacitación) ──
    if (action === 'save-event') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { 
        id, eventType = 'visita_escolar', schoolName, date, time, location, 
        status = 'Programada', leader = 'Ing. Ronny Martinez Reyes', 
        objective, equipment = [], badgeTier = 'Misión Escolar II', studentsCount = 0,
        visibilityState = 'unlocked', visibility_state = 'unlocked',
        isLocked = false, is_locked = 0, isHidden = false, is_hidden = 0
      } = body;

      const eventId = id || `evt-${Date.now()}`;
      const equipmentStr = JSON.stringify(equipment);
      const finalVisState = visibilityState || visibility_state || (isLocked || is_locked === 1 ? 'locked' : isHidden || is_hidden === 1 ? 'hidden' : 'unlocked');
      const lockedVal = finalVisState === 'locked' ? 1 : 0;
      const hiddenVal = finalVisState === 'hidden' ? 1 : 0;
      const sessionsJson = body.sessions_json || (Array.isArray(body.sessions) ? JSON.stringify(body.sessions) : null);

      await env.DB.prepare(`
        INSERT INTO simi_eventos (
          id, event_type, school_name, date, time, location, 
          status, leader, objective, equipment, badge_tier, students_count,
          visibility_state, is_locked, is_hidden, sessions_json, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          event_type = excluded.event_type,
          school_name = excluded.school_name,
          date = excluded.date,
          time = excluded.time,
          location = excluded.location,
          status = excluded.status,
          leader = excluded.leader,
          objective = excluded.objective,
          equipment = excluded.equipment,
          badge_tier = excluded.badge_tier,
          students_count = excluded.students_count,
          visibility_state = excluded.visibility_state,
          is_locked = excluded.is_locked,
          is_hidden = excluded.is_hidden,
          sessions_json = COALESCE(excluded.sessions_json, simi_eventos.sessions_json),
          updated_at = datetime('now')
      `).bind(
        eventId, eventType, schoolName, date, time, location,
        status, leader, objective, equipmentStr, badgeTier, Number(studentsCount),
        finalVisState, lockedVal, hiddenVal, sessionsJson
      ).run();

      return Response.json({ success: true, eventId, visibilityState: finalVisState });
    }

    // ── 4. ELIMINAR EVENTO ──
    if (action === 'delete-event') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { id } = body;
      await env.DB.prepare('DELETE FROM simi_eventos WHERE id = ?').bind(id).run();
      await env.DB.prepare('DELETE FROM simi_asistencias WHERE event_id = ?').bind(id).run();
      return Response.json({ success: true, deletedId: id });
    }

    // ── 5. GUARDAR / EDITAR PROYECTO CAD ──
    if (action === 'save-project') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const {
        id, title, author, status = 'Prototipado', cadTool, material,
        printTime, weightGrams = 100, description,
        cadUrl = '', repoUrl = '', videoUrl = '',
        isPrivate = false, is_private = false,
        assignedMembers = [], assigned_members = []
      } = body;

      let projId = id;
      if (!projId || projId.startsWith('proj-')) {
        try {
          const { results } = await env.DB.prepare('SELECT id FROM simi_proyectos').all();
          let maxHex = 0;
          (results || []).forEach(p => {
            const m = (p.id || '').match(/^SIMI([0-9A-Fa-f]+)$/i);
            if (m) {
              const val = parseInt(m[1], 16);
              if (!isNaN(val) && val > maxHex) maxHex = val;
            }
          });
          const next = maxHex + 1;
          projId = `SIMI${next.toString(16).toUpperCase().padStart(4, '0')}`;
        } catch {
          projId = projId || 'SIMI0001';
        }
      }

      const isPrivVal = (isPrivate || is_private) ? 1 : 0;
      const membersArr = Array.isArray(assignedMembers) && assignedMembers.length > 0 
        ? assignedMembers 
        : (Array.isArray(assigned_members) ? assigned_members : []);
      const membersJson = JSON.stringify(membersArr);

      await env.DB.prepare(`
        INSERT INTO simi_proyectos (
          id, title, author, status, cad_tool, material, print_time, weight_grams, description,
          cad_url, repo_url, video_url, is_private, assigned_members, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          author = excluded.author,
          status = excluded.status,
          cad_tool = excluded.cad_tool,
          material = excluded.material,
          print_time = excluded.print_time,
          weight_grams = excluded.weight_grams,
          description = excluded.description,
          cad_url = excluded.cad_url,
          repo_url = excluded.repo_url,
          video_url = excluded.video_url,
          is_private = excluded.is_private,
          assigned_members = excluded.assigned_members,
          updated_at = datetime('now')
      `).bind(
        projId, title, author, status, cadTool, material, printTime, 
        Number(weightGrams), description, cadUrl, repoUrl, videoUrl,
        isPrivVal, membersJson
      ).run();

      // ── ENVIAR NOTIFICACIÓN AUTOMÁTICA A LOS INTEGRANTES ASIGNADOS ──
      try {
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

        const notifTitle = `🚀 Asignación de Proyecto SIMI3D: ${title || projId}`;
        const notifMsg = `Has sido asignado como integrante responsable del proyecto "${title || projId}". Puedes revisar los detalles, etapa de desarrollo y especificaciones CAD en el Banco de Proyectos.`;

        for (const member of membersArr) {
          const mUserId = member.id || member.email;
          const mEmail = (member.email || '').toLowerCase();
          if (!mUserId && !mEmail) continue;

          // Buscar ID real en perfiles si viene solo email o viceversa
          let targetUserId = mUserId;
          try {
            const foundUser = await env.DB.prepare(
              'SELECT id FROM perfiles WHERE id = ? OR LOWER(email) = LOWER(?) LIMIT 1'
            ).bind(mUserId, mEmail).first();
            if (foundUser?.id) targetUserId = foundUser.id;
          } catch {}

          // Evitar notificaciones duplicadas idénticas en los últimos 1 minuto
          const existingNotif = await env.DB.prepare(`
            SELECT id FROM notificaciones 
            WHERE (user_id = ? OR LOWER(user_id) = LOWER(?) OR user_id = ?) 
              AND title = ? 
              AND datetime(created_at) >= datetime('now', '-1 minute')
            LIMIT 1
          `).bind(targetUserId, mEmail, mUserId, notifTitle).first();

          if (!existingNotif) {
            await env.DB.prepare(`
              INSERT INTO notificaciones (user_id, sender_id, title, message, read, sender_name, is_popup, channel, created_at)
              VALUES (?, ?, ?, ?, 0, 'Semillero SIMI3D', 1, 'simi', datetime('now'))
            `).bind(targetUserId, userId, notifTitle, notifMsg).run();
          }
        }

        // Registrar copia en 'Enviadas' para el administrador / líder que realizó la asignación
        if (userId && membersArr.length > 0) {
          const memberNames = membersArr.map(m => m.name || m.full_name || m.email).filter(Boolean).join(', ');
          const adminSentTitle = `📤 Asignación Enviada: ${title || projId}`;
          const adminSentMsg = `Has asignado el proyecto "${title || projId}" a: ${memberNames || `${membersArr.length} integrantes`}.`;

          const existingAdminNotif = await env.DB.prepare(`
            SELECT id FROM notificaciones 
            WHERE (user_id = ? OR sender_id = ? OR LOWER(user_id) = LOWER(?)) 
              AND title = ? 
              AND datetime(created_at) >= datetime('now', '-1 minute')
            LIMIT 1
          `).bind(userId, userId, userEmail, adminSentTitle).first();

          if (!existingAdminNotif) {
            await env.DB.prepare(`
              INSERT INTO notificaciones (user_id, sender_id, title, message, read, sender_name, is_popup, channel, created_at)
              VALUES (?, ?, ?, ?, 0, 'Semillero SIMI3D', 0, 'simi', datetime('now'))
            `).bind(userId, userId, adminSentTitle, adminSentMsg).run();
          }
        }
      } catch (notifErr) {
        console.warn('[SIMI Project Assignment Notification Error]', notifErr);
      }

      return Response.json({ success: true, projId });
    }

    // ── 6. ELIMINAR PROYECTO ──
    if (action === 'delete-project') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { id } = body;
      await env.DB.prepare('DELETE FROM simi_proyectos WHERE id = ?').bind(id).run();
      return Response.json({ success: true, deletedId: id });
    }

    // ── 7. GUARDAR / EDITAR RECURSO E INVENTARIO ──
    if (action === 'save-resource') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const {
        id, name, category, status = 'Operativa', quantity = 1,
        specs, location, imageUrl
      } = body;

      const resId = id || `res-${Date.now()}`;

      await env.DB.prepare(`
        INSERT INTO simi_recursos (
          id, name, category, status, quantity, specs, location, image_url, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          category = excluded.category,
          status = excluded.status,
          quantity = excluded.quantity,
          specs = excluded.specs,
          location = excluded.location,
          image_url = excluded.image_url,
          updated_at = datetime('now')
      `).bind(resId, name, category, status, Number(quantity), specs, location, imageUrl || '').run();

      return Response.json({ success: true, resId });
    }

    // ── 8. ELIMINAR RECURSO ──
    if (action === 'delete-resource') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { id } = body;
      await env.DB.prepare('DELETE FROM simi_recursos WHERE id = ?').bind(id).run();
      return Response.json({ success: true, deletedId: id });
    }

    // ── 9. ACTUALIZAR / OTORGAR O REVOCAR INSIGNIA TÁCTICA ──
    if (action === 'save-badge') {
      const targetUser = body.targetUserId || userId;
      // Si se está cambiando la insignia de otro usuario, debe ser líder o docente
      if (targetUser !== userId && !isLeaderOrStaff) {
        return Response.json({ error: 'Solo docentes o líderes pueden condecorar a otros miembros' }, { status: 403 });
      }

      const { pinId, tier = 'I', exp = 100 } = body;

      // Si se pasa tier === 'none' o tier === null, se revoca la insignia
      if (tier === 'none' || !tier) {
        await env.DB.prepare('DELETE FROM simi_insignias WHERE user_id = ? AND pin_id = ?').bind(targetUser, pinId).run();
        return Response.json({ success: true, pinId, tier: null, revoked: true });
      }

      await env.DB.prepare(`
        INSERT INTO simi_insignias (id, user_id, pin_id, tier, exp_earned, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          tier = excluded.tier,
          exp_earned = excluded.exp_earned,
          updated_at = datetime('now')
      `).bind(`${targetUser}_${pinId}`, targetUser, pinId, tier, Number(exp)).run();

      return Response.json({ success: true, pinId, tier, exp });
    }

    // ── 9B. GUARDAR / EDITAR URL DE IMAGEN DE INSIGNIA EN CATÁLOGO ──
    if (action === 'save-badge-image') {
      if (!isLeaderOrStaff) return Response.json({ error: 'Solo docentes o líderes pueden modificar el catálogo de insignias' }, { status: 403 });
      const { pinId, badgeImageUrl } = body;
      if (!pinId) return Response.json({ error: 'Falta pinId' }, { status: 400 });

      if (!badgeImageUrl || !badgeImageUrl.trim()) {
        await env.DB.prepare('DELETE FROM simi_catalogo_insignias WHERE pin_id = ?').bind(pinId).run();
        return Response.json({ success: true, pinId, badgeImageUrl: null, deleted: true });
      }

      let cleanUrl = badgeImageUrl.trim();
      // Normalizar PostImages visor: https://postimg.cc/xxxx -> https://i.postimg.cc/xxxx/image.png
      const postimgMatch = cleanUrl.match(/https?:\/\/(?:www\.)?postimg\.cc\/(?:image\/)?([a-zA-Z0-9_-]+)/i);
      if (postimgMatch && !cleanUrl.includes('i.postimg.cc')) {
        cleanUrl = `https://i.postimg.cc/${postimgMatch[1]}/image.png`;
      }
      // Normalizar Google Drive
      if (cleanUrl.includes('drive.google.com/file/d/')) {
        const match = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          cleanUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
      }
      // Normalizar Dropbox
      if (cleanUrl.includes('dropbox.com') && cleanUrl.includes('dl=0')) {
        cleanUrl = cleanUrl.replace('dl=0', 'raw=1');
      }
      // Normalizar Imgur
      const imgurMatch = cleanUrl.match(/https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9_-]+)(?!\.)/i);
      if (imgurMatch && !cleanUrl.includes('i.imgur.com')) {
        cleanUrl = `https://i.imgur.com/${imgurMatch[1]}.png`;
      }

      await env.DB.prepare(`
        INSERT INTO simi_catalogo_insignias (pin_id, badge_image_url, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(pin_id) DO UPDATE SET
          badge_image_url = excluded.badge_image_url,
          updated_at = datetime('now')
      `).bind(pinId, cleanUrl).run();

      return Response.json({ success: true, pinId, badgeImageUrl: cleanUrl });
    }

    // ── 10. GUARDAR / EDITAR RECURSO O HERRAMIENTA WEB ──
    if (action === 'save-web-resource') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const {
        id, name, url, host, logoUrl, category = 'Repositorios & Modelos',
        tag = '', badge = '', color = '#06b6d4', icon = 'Globe',
        featured = true, description = ''
      } = body;

      const webId = id || `web-${Date.now()}`;
      let finalHost = host;
      if (!finalHost && url) {
        try {
          finalHost = new URL(url).hostname.replace(/^www\./, '');
        } catch {
          finalHost = url;
        }
      }

      await env.DB.prepare(`
        INSERT INTO simi_web_recursos (
          id, name, url, host, logo_url, category, tag, badge, color, icon, featured, description, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          url = excluded.url,
          host = excluded.host,
          logo_url = excluded.logo_url,
          category = excluded.category,
          tag = excluded.tag,
          badge = excluded.badge,
          color = excluded.color,
          icon = excluded.icon,
          featured = excluded.featured,
          description = excluded.description,
          updated_at = datetime('now')
      `).bind(
        webId, name, url, finalHost || '', logoUrl || null,
        category, tag, badge, color, icon,
        featured ? 1 : 0, description
      ).run();

      return Response.json({ success: true, webId, host: finalHost });
    }

    // ── 11. ELIMINAR RECURSO WEB ──
    if (action === 'delete-web-resource') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { id } = body;
      await env.DB.prepare('DELETE FROM simi_web_recursos WHERE id = ?').bind(id).run();
      return Response.json({ success: true, deletedId: id });
    }

    // ── 12. SINCRONIZAR / MIGRAR TODOS LOS RECURSOS WEB A D1 (BOTÓN DE GUARDADO MASIVO) ──
    if (action === 'sync-all-web-resources') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { items } = body;
      if (!Array.isArray(items)) return Response.json({ error: 'items debe ser un array' }, { status: 400 });

      for (const item of items) {
        let finalHost = item.host;
        if (!finalHost && item.url) {
          try {
            finalHost = new URL(item.url).hostname.replace(/^www\./, '');
          } catch {
            finalHost = item.url;
          }
        }
        await env.DB.prepare(`
          INSERT INTO simi_web_recursos (
            id, name, url, host, logo_url, category, tag, badge, color, icon, featured, description, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            url = excluded.url,
            host = excluded.host,
            logo_url = excluded.logo_url,
            category = excluded.category,
            tag = excluded.tag,
            badge = excluded.badge,
            color = excluded.color,
            icon = excluded.icon,
            featured = excluded.featured,
            description = excluded.description,
            updated_at = datetime('now')
        `).bind(
          item.id, item.name, item.url, finalHost || '', item.logoUrl || null,
          item.category || 'Repositorios & Modelos', item.tag || '', item.badge || '',
          item.color || '#06b6d4', item.icon || 'Globe',
          item.featured ? 1 : 0, item.description || ''
        ).run();
      }

      return Response.json({ success: true, count: items.length });
    }

    // ── 12.B. SINCRONIZAR / MIGRAR TODOS LOS EVENTOS A D1 (AUTO-RESPALDO SEGURO) ──
    if (action === 'sync-all-events') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { items } = body;
      if (!Array.isArray(items)) return Response.json({ error: 'items debe ser un array' }, { status: 400 });

      for (const item of items) {
        if (!item || !item.id) continue;
        const eventType = item.eventType || item.event_type || 'visita_escolar';
        const schoolName = item.schoolName || item.school_name || 'Institución Educativa STEAM';
        const date = item.date || '';
        const time = item.time || '8:30 AM – 12:00 PM';
        const location = item.location || 'Aula Múltiple STEAM';
        const status = item.status || 'Programada';
        const leader = item.leader || 'Ing. Ronny Martinez Reyes';
        const objective = item.objective || '';
        const equipmentStr = typeof item.equipment === 'string' ? item.equipment : JSON.stringify(item.equipment || []);
        const badgeTier = item.badgeTier || item.badge_tier || 'Misión Escolar II';
        const studentsCount = Number(item.studentsCount || item.students_count || 0);
        const visState = item.visibilityState || item.visibility_state || (item.isLocked || item.is_locked ? 'locked' : (item.isHidden || item.is_hidden ? 'hidden' : 'unlocked'));
        const lockedVal = visState === 'locked' ? 1 : 0;
        const hiddenVal = visState === 'hidden' ? 1 : 0;

        const sessionsJson = item.sessions_json || (Array.isArray(item.sessions) ? JSON.stringify(item.sessions) : null);

        await env.DB.prepare(`
          INSERT INTO simi_eventos (
            id, event_type, school_name, date, time, location,
            status, leader, objective, equipment, badge_tier, students_count,
            visibility_state, is_locked, is_hidden, sessions_json, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            event_type = excluded.event_type,
            school_name = excluded.school_name,
            date = excluded.date,
            time = excluded.time,
            location = excluded.location,
            status = excluded.status,
            leader = excluded.leader,
            objective = excluded.objective,
            equipment = excluded.equipment,
            badge_tier = excluded.badge_tier,
            students_count = excluded.students_count,
            visibility_state = excluded.visibility_state,
            is_locked = excluded.is_locked,
            is_hidden = excluded.is_hidden,
            sessions_json = COALESCE(excluded.sessions_json, simi_eventos.sessions_json),
            updated_at = datetime('now')
        `).bind(
          item.id, eventType, schoolName, date, time, location,
          status, leader, objective, equipmentStr, badgeTier, studentsCount,
          visState, lockedVal, hiddenVal, sessionsJson
        ).run();
      }

      return Response.json({ success: true, count: items.length });
    }

    // ── 13. BORRAR NOTIFICACIONES SIMI (DIRECTO DESDE SIMI API) ──
    if (action === 'delete-notifications') {
      const { ids, all } = body;
      if (all) {
        await env.DB.prepare(`
          UPDATE notificaciones SET is_dismissed = 1
          WHERE (user_id = ? OR LOWER(user_id) = LOWER(?) OR sender_id = ? OR LOWER(sender_id) = LOWER(?))
            AND (channel = 'simi' OR LOWER(title) LIKE '%simi%' OR LOWER(title) LIKE '%semillero%')
        `).bind(userId, userEmail, userId, userEmail).run();
        return Response.json({ success: true, allDeleted: true });
      }

      if (Array.isArray(ids) && ids.length > 0) {
        const numericIds = ids.map(id => Number(id)).filter(id => !isNaN(id));
        if (numericIds.length > 0) {
          const placeholders = numericIds.map(() => '?').join(',');
          await env.DB.prepare(
            `UPDATE notificaciones SET is_dismissed = 1 WHERE id IN (${placeholders})`
          ).bind(...numericIds).run();
          return Response.json({ success: true, deleted: numericIds.length });
        }
      }
      return Response.json({ success: true });
    }

    // ── 14. GUARDAR / EDITAR SERVICIO O CAPACITACIÓN SIMI3D ──
    if (action === 'save-service') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const {
        id, category = 'capacitacion', categoryLabel = 'Capacitación STEAM',
        title, targetAudience = '', description = '', features = [],
        pricingInfo = 'Cotización a convenir', status = 'active',
        iconKey = 'Box', color = '#06b6d4', badge = '', imageUrl = null
      } = body;

      if (!title || !title.trim()) return Response.json({ error: 'El título del servicio es obligatorio' }, { status: 400 });

      const serviceId = id || `serv-${Date.now()}`;
      const featuresStr = typeof features === 'string' ? features : JSON.stringify(Array.isArray(features) ? features : []);
      const isLockedVal = status === 'locked' ? 1 : 0;
      const isHiddenVal = status === 'hidden' ? 1 : 0;

      await env.DB.prepare(`
        INSERT INTO simi_servicios (
          id, category, category_label, title, target_audience, description,
          features, pricing_info, status, is_locked, is_hidden, icon_key, color, badge, image_url, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          category = excluded.category,
          category_label = excluded.category_label,
          title = excluded.title,
          target_audience = excluded.target_audience,
          description = excluded.description,
          features = excluded.features,
          pricing_info = excluded.pricing_info,
          status = excluded.status,
          is_locked = excluded.is_locked,
          is_hidden = excluded.is_hidden,
          icon_key = excluded.icon_key,
          color = excluded.color,
          badge = excluded.badge,
          image_url = excluded.image_url,
          updated_at = datetime('now')
      `).bind(
        serviceId, category, categoryLabel, title.trim(), targetAudience,
        description, featuresStr, pricingInfo, status, isLockedVal, isHiddenVal,
        iconKey, color, badge, imageUrl
      ).run();

      return Response.json({ success: true, serviceId });
    }

    // ── 15. ALTERNAR VISIBILIDAD / BLOQUEO DE SERVICIO (TOGGLE RÁPIDO) ──
    if (action === 'toggle-service-status') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { id, nextStatus } = body; // 'active' | 'hidden' | 'locked'
      if (!id || !nextStatus) return Response.json({ error: 'Faltan parámetros' }, { status: 400 });

      const isLockedVal = nextStatus === 'locked' ? 1 : 0;
      const isHiddenVal = nextStatus === 'hidden' ? 1 : 0;

      await env.DB.prepare(`
        UPDATE simi_servicios 
        SET status = ?, is_locked = ?, is_hidden = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(nextStatus, isLockedVal, isHiddenVal, id).run();

      return Response.json({ success: true, id, status: nextStatus });
    }

    // ── 16. ELIMINAR SERVICIO ──
    if (action === 'delete-service') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { id } = body;
      if (!id) return Response.json({ error: 'Falta id' }, { status: 400 });

      await env.DB.prepare('DELETE FROM simi_servicios WHERE id = ?').bind(id).run();
      return Response.json({ success: true, deletedId: id });
    }

    // ── 17. SINCRONIZAR TODOS LOS SERVICIOS (SEMILLA O MIGRACIÓN MASIVA) ──
    if (action === 'sync-all-services') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { items } = body;
      if (!Array.isArray(items)) return Response.json({ error: 'items debe ser un array' }, { status: 400 });

      for (const item of items) {
        if (!item || !item.id) continue;
        const featuresStr = typeof item.features === 'string' ? item.features : JSON.stringify(item.features || []);
        const stat = item.status || 'active';
        const isLockedVal = stat === 'locked' || item.isLocked ? 1 : 0;
        const isHiddenVal = stat === 'hidden' || item.isHidden ? 1 : 0;

        await env.DB.prepare(`
          INSERT INTO simi_servicios (
            id, category, category_label, title, target_audience, description,
            features, pricing_info, status, is_locked, is_hidden, icon_key, color, badge, image_url, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            category = excluded.category,
            category_label = excluded.category_label,
            title = excluded.title,
            target_audience = excluded.target_audience,
            description = excluded.description,
            features = excluded.features,
            pricing_info = excluded.pricing_info,
            status = excluded.status,
            is_locked = excluded.is_locked,
            is_hidden = excluded.is_hidden,
            icon_key = excluded.icon_key,
            color = excluded.color,
            badge = excluded.badge,
            image_url = excluded.image_url,
            updated_at = datetime('now')
        `).bind(
          item.id, item.category || 'capacitacion', item.categoryLabel || 'Capacitación STEAM',
          item.title || 'Servicio SIMI3D', item.targetAudience || '', item.description || '',
          featuresStr, item.pricingInfo || 'Cotización a convenir', stat, isLockedVal, isHiddenVal,
          item.iconKey || 'Box', item.color || '#06b6d4', item.badge || '', item.imageUrl || null
        ).run();
      }

      return Response.json({ success: true, count: items.length });
    }

    return Response.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ── CREACIÓN AUTOMÁTICA DEL ESQUEMA SQL EN CLOUDFLARE D1 ──
async function ensureSimiSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_eventos (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL DEFAULT 'visita_escolar',
      school_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Programada',
      leader TEXT NOT NULL DEFAULT 'Ing. Ronny Martinez Reyes',
      objective TEXT,
      equipment TEXT,
      badge_tier TEXT DEFAULT 'Misión Escolar II',
      students_count INTEGER DEFAULT 0,
      visibility_state TEXT DEFAULT 'unlocked',
      is_locked INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      sessions_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE simi_eventos ADD COLUMN visibility_state TEXT DEFAULT "unlocked"').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_eventos ADD COLUMN is_locked INTEGER DEFAULT 0').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_eventos ADD COLUMN is_hidden INTEGER DEFAULT 0').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_eventos ADD COLUMN sessions_json TEXT').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_asistencias ADD COLUMN session_id TEXT DEFAULT "c1"').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_asistencias ADD COLUMN session_date TEXT').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_asistencias ADD COLUMN session_topic TEXT').run(); } catch (_) { }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_asistencias (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Asistiré',
      attended INTEGER DEFAULT 0,
      attended_weight REAL DEFAULT 1.0,
      session_id TEXT DEFAULT 'c1',
      session_date TEXT,
      session_topic TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE simi_asistencias ADD COLUMN attended_weight REAL DEFAULT 1.0').run(); } catch (_) { }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_sesion_asistencia (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      event_title TEXT,
      event_type TEXT DEFAULT 'capacitacion_tecnica',
      target_word TEXT NOT NULL,
      options_json TEXT NOT NULL,
      family_name TEXT,
      duration_seconds INTEGER DEFAULT 8,
      session_id TEXT DEFAULT 'c1',
      started_at TEXT DEFAULT (datetime('now')),
      expires_at INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_by TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE simi_sesion_asistencia ADD COLUMN session_id TEXT DEFAULT "c1"').run(); } catch (_) { }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_proyectos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Semillero SIMI3D',
      status TEXT NOT NULL DEFAULT 'En Prototipado',
      cad_tool TEXT NOT NULL DEFAULT 'Fusion 360',
      material TEXT DEFAULT 'PLA+ / PETG',
      print_time TEXT DEFAULT '4h',
      weight_grams REAL DEFAULT 100,
      description TEXT,
      cad_url TEXT,
      repo_url TEXT,
      video_url TEXT,
      is_private INTEGER DEFAULT 0,
      assigned_members TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE simi_proyectos ADD COLUMN cad_url TEXT').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_proyectos ADD COLUMN repo_url TEXT').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_proyectos ADD COLUMN video_url TEXT').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_proyectos ADD COLUMN is_private INTEGER DEFAULT 0').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_proyectos ADD COLUMN assigned_members TEXT DEFAULT "[]"').run(); } catch (_) { }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_recursos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Impresora FDM',
      status TEXT NOT NULL DEFAULT 'Operativa',
      quantity INTEGER DEFAULT 1,
      specs TEXT,
      location TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_insignias (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      pin_id TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'I',
      exp_earned INTEGER DEFAULT 100,
      unlocked_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_web_recursos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      host TEXT,
      logo_url TEXT,
      category TEXT NOT NULL DEFAULT 'Repositorios & Modelos',
      tag TEXT,
      badge TEXT,
      color TEXT DEFAULT '#06b6d4',
      icon TEXT DEFAULT 'Globe',
      featured INTEGER DEFAULT 1,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_catalogo_insignias (
      pin_id TEXT PRIMARY KEY,
      badge_image_url TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_servicios (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL DEFAULT 'capacitacion',
      category_label TEXT DEFAULT 'Capacitación STEAM',
      title TEXT NOT NULL,
      target_audience TEXT,
      description TEXT,
      features TEXT DEFAULT '[]',
      pricing_info TEXT DEFAULT 'Cotización a convenir',
      status TEXT NOT NULL DEFAULT 'active',
      is_locked INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      icon_key TEXT DEFAULT 'Box',
      color TEXT DEFAULT '#06b6d4',
      badge TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  try { await env.DB.prepare('ALTER TABLE simi_servicios ADD COLUMN is_locked INTEGER DEFAULT 0').run(); } catch (_) { }
  try { await env.DB.prepare('ALTER TABLE simi_servicios ADD COLUMN is_hidden INTEGER DEFAULT 0').run(); } catch (_) { }

  // Asegurar registro de SIMI3D en la tabla de cursos (ID 6) y grupo base
  try {
    await env.DB.prepare(`
      INSERT INTO cursos (id, abbr, slug, name) 
      VALUES (6, 'SIMI', 'semillero-modelado-impresion-3d', 'Semillero de Investigación en Modelado e Impresión 3D')
      ON CONFLICT(id) DO UPDATE SET 
        abbr = 'SIMI',
        slug = 'semillero-modelado-impresion-3d',
        name = 'Semillero de Investigación en Modelado e Impresión 3D'
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO grupos (id, course_id, name, teacher)
      VALUES (7, 6, 'SIMI 2026II', 'Prof. Ronny Martinez')
    `).run();
  } catch {}
}

