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
      badgeMap: {},
      members: [],
      isLeaderOrStaff
    });
  }

  try {
    await ensureSimiSchema(env);
    // Ejecutar todas las consultas en paralelo con Promise.all (velocidad < 30ms)
    const [eventsRes, attendancesRes, projectsRes, resourcesRes, userBadgesRes, allBadgesRes, membersRes, webResourcesRes, catalogImagesRes] = await Promise.all([
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
          COALESCE(g.name, CASE WHEN LOWER(p.email) = LOWER(?) OR p.role IN ('admin', 'docente', 'profesor') THEN 'Dirección I+D' WHEN p.role IN ('leader', 'lider') THEN 'Líder Semillero' ELSE 'SIMI 2026II' END) AS group_name
        FROM perfiles p
        LEFT JOIN grupos_usuario gu ON (gu.user_id = p.id OR LOWER(gu.user_id) = LOWER(p.email))
        LEFT JOIN grupos g ON g.id = gu.group_id AND (g.course_id = 6 OR g.name LIKE '%SIMI%' OR g.name LIKE '%Semillero%')
        WHERE p.role IN ('leader', 'lider')
           OR LOWER(p.email) = LOWER(?)
           OR (gu.group_id IS NOT NULL AND g.id IS NOT NULL)
        ORDER BY 
          CASE 
            WHEN LOWER(p.email) = LOWER(?) OR p.role IN ('admin', 'docente', 'profesor') THEN 1
            WHEN p.role IN ('leader', 'lider') THEN 2
            ELSE 3
          END, p.full_name ASC
      `).bind(directorEmail, directorEmail, directorEmail).all(),
      env.DB.prepare('SELECT * FROM simi_web_recursos ORDER BY created_at ASC').all(),
      env.DB.prepare('SELECT pin_id, badge_image_url FROM simi_catalogo_insignias').all()
    ]);

    const events = eventsRes?.results || [];
    const attendances = attendancesRes?.results || [];
    const projects = projectsRes?.results || [];
    const resources = resourcesRes?.results || [];
    const userBadges = userBadgesRes?.results || [];
    const allBadges = allBadgesRes?.results || [];
    let members = membersRes?.results || [];

    // Fallback ultra-rápido si aún no hay miembros
    if (!members || members.length === 0) {
      try {
        const { results } = await env.DB.prepare(`
          SELECT id, email, full_name, avatar_url, role, created_at, 'Dirección I+D' AS group_name
          FROM perfiles 
          WHERE role IN ('leader', 'lider') OR LOWER(email) = LOWER(?)
        `).bind(directorEmail).all();
        members = results || [];
      } catch {}
    }

    // Mapear asistencias dentro de cada evento
    const eventsWithAttendees = (events || []).map(evt => {
      const evtAttendees = (attendances || []).filter(a => a.event_id === evt.id);
      return {
        ...evt,
        equipment: evt.equipment ? JSON.parse(evt.equipment) : [],
        attendees: evtAttendees.map(a => ({
          userId: a.user_id,
          name: a.user_name,
          status: a.status,
          attended: a.attended === 1,
          updatedAt: a.updated_at
        }))
      };
    });

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

    return Response.json({
      success: true,
      events: eventsWithAttendees,
      projects: projects || [],
      resources: resources || [],
      webResources: webResources || [],
      badgeMap,
      memberBadgesMap,
      catalogImageUrlsMap,
      members: members || [],
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
      badgeMap: {},
      members: [],
      isLeaderOrStaff
    });
  }
}

export async function onRequestPost({ request, env, data }) {
  await ensureSimiSchema(env);

  const userId = data?.user?.id || data?.user?.email || 'guest';
  const userName = data?.user?.full_name || data?.user?.name || data?.user?.displayName || 'Semillerista';
  const role = (data?.user?.role || '').toLowerCase();
  const isLeaderOrStaff = ['admin', 'docente', 'profesor', 'teacher', 'leader', 'lider'].includes(role);

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
      const { eventId, targetUserId, attended } = body;
      
      const attendanceId = `${eventId}_${targetUserId}`;
      const attendedVal = attended ? 1 : 0;

      await env.DB.prepare(`
        INSERT INTO simi_asistencias (id, event_id, user_id, user_name, status, attended, updated_at)
        VALUES (?, ?, ?, 'Semillerista', 'Asistiré', ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET 
          attended = excluded.attended,
          updated_at = datetime('now')
      `).bind(attendanceId, eventId, targetUserId, attendedVal).run();

      return Response.json({ success: true, attended: attendedVal });
    }

    // ── 3. GUARDAR / EDITAR EVENTO (Visita Escolar o Capacitación) ──
    if (action === 'save-event') {
      if (!isLeaderOrStaff) return Response.json({ error: 'No autorizado' }, { status: 403 });
      const { 
        id, eventType = 'visita_escolar', schoolName, date, time, location, 
        status = 'Programada', leader = 'Ing. Ronny Martinez Reyes', 
        objective, equipment = [], badgeTier = 'Misión Escolar II', studentsCount = 0
      } = body;

      const eventId = id || `evt-${Date.now()}`;
      const equipmentStr = JSON.stringify(equipment);

      await env.DB.prepare(`
        INSERT INTO simi_eventos (
          id, event_type, school_name, date, time, location, 
          status, leader, objective, equipment, badge_tier, students_count, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
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
          updated_at = datetime('now')
      `).bind(
        eventId, eventType, schoolName, date, time, location,
        status, leader, objective, equipmentStr, badgeTier, Number(studentsCount)
      ).run();

      return Response.json({ success: true, eventId });
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
        id, title, author, status = 'En Prototipado', cadTool, material,
        printTime, weightGrams = 100, description
      } = body;

      const projId = id || `proj-${Date.now()}`;

      await env.DB.prepare(`
        INSERT INTO simi_proyectos (
          id, title, author, status, cad_tool, material, print_time, weight_grams, description, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          author = excluded.author,
          status = excluded.status,
          cad_tool = excluded.cad_tool,
          material = excluded.material,
          print_time = excluded.print_time,
          weight_grams = excluded.weight_grams,
          description = excluded.description,
          updated_at = datetime('now')
      `).bind(projId, title, author, status, cadTool, material, printTime, Number(weightGrams), description).run();

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

      const cleanUrl = badgeImageUrl.trim();
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS simi_asistencias (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Asistiré',
      attended INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

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
