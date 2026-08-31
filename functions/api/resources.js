// ── API de Gestión de Recursos Educativos (Cloudflare D1) ──────────

export async function onRequestGet({ env, data }) {
  await ensureResourcesSchema(env);

  const role = (data?.user?.role || '').toLowerCase();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher'].includes(role);

  try {
    const { results: customResources } = await env.DB.prepare(`
      SELECT * FROM recursos_educativos 
      ORDER BY created_at DESC
    `).all();

    const { results: visibilityList } = await env.DB.prepare(`
      SELECT resource_id, is_visible FROM recursos_visibilidad
    `).all();

    const visibilityMap = {};
    (visibilityList || []).forEach(v => {
      visibilityMap[v.resource_id] = v.is_visible;
    });

    return Response.json({
      success: true,
      resources: customResources || [],
      visibilityMap
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message, resources: [], visibilityMap: {} });
  }
}

export async function onRequestPost({ request, env, data }) {
  const role = (data.user?.role || '').toLowerCase();
  const email = (data.user?.email || '').toLowerCase();
  const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher'].includes(role) || (adminEmail && email === adminEmail);

  if (!isStaff) {
    return Response.json({ error: 'Solo docentes o administradores pueden gestionar recursos' }, { status: 403 });
  }

  await ensureResourcesSchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { action = 'save' } = body;

  // 1. Toggle de Visibilidad Rápido (para recursos estáticos o de BD)
  if (action === 'toggle-visibility') {
    const { id, is_visible } = body;
    if (!id) return Response.json({ error: 'ID requerido' }, { status: 400 });

    const visibleVal = is_visible ? 1 : 0;

    await env.DB.prepare(`
      INSERT INTO recursos_visibilidad (resource_id, is_visible, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(resource_id) DO UPDATE SET
        is_visible = excluded.is_visible,
        updated_at = datetime('now')
    `).bind(id, visibleVal).run();

    // Si además existe en recursos_educativos, sincronizar
    await env.DB.prepare(`
      UPDATE recursos_educativos SET is_active = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(visibleVal, id).run();

    return Response.json({ success: true, id, is_visible: visibleVal });
  }

  // 2. Acción de eliminación
  if (action === 'delete') {
    const { id } = body;
    if (!id) {
      return Response.json({ error: 'ID de recurso requerido' }, { status: 400 });
    }

    await env.DB.prepare(`
      DELETE FROM recursos_educativos WHERE id = ?
    `).bind(id).run();

    await env.DB.prepare(`
      DELETE FROM recursos_visibilidad WHERE resource_id = ?
    `).bind(id).run();

    return Response.json({ success: true, deleted_id: id });
  }

  // 3. Crear o Editar Recurso
  const {
    id,
    course_abbr = 'RE',
    title,
    source,
    source_type,
    description,
    category = 'projects',
    type = 'YouTube',
    url,
    video_id,
    tags,
    is_visible = 1
  } = body;

  if (!title || !title.trim()) {
    return Response.json({ error: 'El título es obligatorio' }, { status: 400 });
  }
  if (!url || !url.trim()) {
    return Response.json({ error: 'La URL es obligatoria' }, { status: 400 });
  }

  const resourceId = id || `custom-rec-${Date.now()}`;
  let extractedVideoId = video_id;

  // Auto-extraer videoId si es URL de YouTube y no se especificó
  if (!extractedVideoId && (url.includes('youtube.com') || url.includes('youtu.be'))) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      extractedVideoId = match[1];
    }
  }

  const tagsString = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '');
  const visibleInt = is_visible ? 1 : 0;

  await env.DB.prepare(`
    INSERT INTO recursos_educativos (
      id, course_abbr, title, source, source_type, description, category, type, url, video_id, tags, is_custom, is_active, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      course_abbr = excluded.course_abbr,
      title = excluded.title,
      source = excluded.source,
      source_type = excluded.source_type,
      description = excluded.description,
      category = excluded.category,
      type = excluded.type,
      url = excluded.url,
      video_id = excluded.video_id,
      tags = excluded.tags,
      is_active = excluded.is_active,
      updated_at = datetime('now')
  `).bind(
    resourceId,
    course_abbr,
    title.trim(),
    source ? source.trim() : 'Recurso Docente',
    source_type ? source_type.trim() : type,
    description ? description.trim() : '',
    category,
    type,
    url.trim(),
    extractedVideoId || null,
    tagsString,
    visibleInt
  ).run();

  await env.DB.prepare(`
    INSERT INTO recursos_visibilidad (resource_id, is_visible, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(resource_id) DO UPDATE SET
      is_visible = excluded.is_visible,
      updated_at = datetime('now')
  `).bind(resourceId, visibleInt).run();

  return Response.json({
    success: true,
    resource: {
      id: resourceId,
      course_abbr,
      title: title.trim(),
      source: source ? source.trim() : 'Recurso Docente',
      source_type: source_type ? source_type.trim() : type,
      description: description ? description.trim() : '',
      category,
      type,
      url: url.trim(),
      video_id: extractedVideoId || null,
      tags: tagsString,
      is_visible: visibleInt
    }
  });
}

export async function onRequestDelete({ request, env, data }) {
  const role = (data.user?.role || '').toLowerCase();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher'].includes(role);

  if (!isStaff) {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }

  await ensureResourcesSchema(env);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id } = body;
  if (!id) return Response.json({ error: 'Falta ID' }, { status: 400 });

  await env.DB.prepare('DELETE FROM recursos_educativos WHERE id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM recursos_visibilidad WHERE resource_id = ?').bind(id).run();
  return Response.json({ success: true, deleted_id: id });
}

async function ensureResourcesSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS recursos_educativos (
      id TEXT PRIMARY KEY,
      course_abbr TEXT NOT NULL DEFAULT 'RE',
      title TEXT NOT NULL,
      source TEXT,
      source_type TEXT,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'projects',
      type TEXT DEFAULT 'YouTube',
      url TEXT NOT NULL,
      video_id TEXT,
      tags TEXT,
      is_custom INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS recursos_visibilidad (
      resource_id TEXT PRIMARY KEY,
      is_visible INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
}
