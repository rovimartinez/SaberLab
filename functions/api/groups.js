export async function onRequestGet({ request, env, data }) {
  await ensureGroupsSchema(env);

  const url = new URL(request.url);
  const courseId = url.searchParams.get('course_id');
  const groupId = url.searchParams.get('group_id');

  const allStudents = url.searchParams.get('all_students') || url.searchParams.get('students');
  if (allStudents) {
    // 1. Obtener grupos registrados
    let allGrupos = [];
    try {
      const { results } = await env.DB.prepare(
        'SELECT id, course_id, name, teacher, COALESCE(is_active, 1) AS is_active FROM grupos'
      ).all();
      allGrupos = results || [];
    } catch {}

    const groupMap = {};
    allGrupos.forEach(g => {
      groupMap[g.id] = g;
      groupMap[String(g.id)] = g;
    });

    // 2. Obtener usuarios en grupos_usuario
    let guList = [];
    try {
      const { results } = await env.DB.prepare('SELECT user_id, group_id FROM grupos_usuario').all();
      guList = results || [];
    } catch {}

    // 3. Obtener usuarios en inscripciones
    let inscList = [];
    try {
      const { results } = await env.DB.prepare('SELECT user_id, course_id, group_id FROM inscripciones').all();
      inscList = results || [];
    } catch {}

    // 4. Obtener perfiles de usuarios
    let perfilesList = [];
    try {
      const { results } = await env.DB.prepare('SELECT id, email, full_name, avatar_url, role FROM perfiles').all();
      perfilesList = results || [];
    } catch {}

    // 5. Obtener solicitudes de acceso
    let solicitudesList = [];
    try {
      const { results } = await env.DB.prepare('SELECT id, name, email FROM solicitudes_acceso').all();
      solicitudesList = results || [];
    } catch {}

    const profileLookup = (targetUserId) => {
      if (!targetUserId) return null;
      const tid = String(targetUserId).trim().toLowerCase();
      
      const p = perfilesList.find(item => {
        const iId = String(item.id || '').trim().toLowerCase();
        const iEmail = String(item.email || '').trim().toLowerCase();
        return iId === tid || iEmail === tid || (iEmail && tid.includes(iEmail)) || (iId && tid.includes(iId));
      });
      if (p) {
        return {
          id: p.id,
          email: p.email || '',
          full_name: p.full_name || (p.email ? p.email.split('@')[0] : targetUserId),
          avatar_url: p.avatar_url || null,
          role: p.role || 'student'
        };
      }

      const req = solicitudesList.find(item => {
        const rId = String(item.id || '').trim().toLowerCase();
        const rEmail = String(item.email || '').trim().toLowerCase();
        const rName = String(item.name || '').trim().toLowerCase();
        return rId === tid || rEmail === tid || (rEmail && tid.includes(rEmail)) || (rId && tid.includes(rId)) || rName === tid;
      });
      if (req) {
        return {
          id: req.id || req.email || targetUserId,
          email: req.email || '',
          full_name: req.name || (req.email ? req.email.split('@')[0] : targetUserId),
          avatar_url: null,
          role: 'student'
        };
      }

      const isEmail = targetUserId.includes('@');
      const cleanName = isEmail ? targetUserId.split('@')[0].replace(/[._-]/g, ' ') : targetUserId;
      return {
        id: targetUserId,
        email: isEmail ? targetUserId : '',
        full_name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        avatar_url: null,
        role: 'student'
      };
    };

    // Construir lista única de estudiantes consolidando por usuario
    const studentsMap = new Map();

    const addStudentAssignment = (rawUserId, groupId, courseId) => {
      if (!rawUserId) return;
      const prof = profileLookup(rawUserId);
      if (!prof) return;

      const isTeacherOrAdmin = prof.role === 'teacher' || prof.role === 'admin' || prof.role === 'docente' || prof.role === 'administrador';
      if (isTeacherOrAdmin) return;

      const userKey = (prof.email && prof.email.trim()) ? prof.email.trim().toLowerCase() : String(prof.id || rawUserId).trim().toLowerCase();
      const mapKey = groupId ? `${userKey}_${groupId}` : userKey;
      const grp = groupId ? (groupMap[groupId] || groupMap[String(groupId)]) : null;
      const cId = grp?.course_id || courseId || 1;

      if (!studentsMap.has(mapKey)) {
        studentsMap.set(mapKey, {
          id: prof.id || rawUserId,
          email: prof.email || '',
          full_name: prof.full_name || 'Estudiante',
          avatar_url: prof.avatar_url || null,
          role: prof.role || 'student',
          group_id: grp?.id || groupId || null,
          group_name: grp?.name || (groupId ? `Grupo #${groupId}` : 'Sin grupo asignado'),
          course_id: cId,
          teacher: grp?.teacher || 'Prof. Ronny Martinez',
          group_is_active: grp?.is_active !== undefined ? grp.is_active : 1
        });
      } else {
        const existing = studentsMap.get(mapKey);
        if (!existing.group_id && (grp?.id || groupId)) {
          existing.group_id = grp?.id || groupId;
          existing.group_name = grp?.name || (groupId ? `Grupo #${groupId}` : 'Sin grupo asignado');
          existing.course_id = cId;
          existing.teacher = grp?.teacher || existing.teacher;
        }
        if (!existing.email && prof.email) existing.email = prof.email;
        if ((!existing.full_name || existing.full_name === 'Estudiante') && prof.full_name) {
          existing.full_name = prof.full_name;
        }
        if (!existing.avatar_url && prof.avatar_url) existing.avatar_url = prof.avatar_url;
      }
    };

    // A. Agregar primero las asignaciones en grupos_usuario (las de las 3 tarjetas de grupos)
    const usersWithGroupSet = new Set();
    guList.forEach(gu => {
      addStudentAssignment(gu.user_id, gu.group_id, null);
      if (gu.user_id) {
        usersWithGroupSet.add(String(gu.user_id).trim().toLowerCase());
        const prof = profileLookup(gu.user_id);
        if (prof?.id) usersWithGroupSet.add(String(prof.id).trim().toLowerCase());
        if (prof?.email) usersWithGroupSet.add(String(prof.email).trim().toLowerCase());
      }
    });

    // B. Agregar las asignaciones en inscripciones
    inscList.forEach(ins => {
      if (ins.group_id) {
        addStudentAssignment(ins.user_id, ins.group_id, ins.course_id);
        if (ins.user_id) {
          usersWithGroupSet.add(String(ins.user_id).trim().toLowerCase());
          const prof = profileLookup(ins.user_id);
          if (prof?.id) usersWithGroupSet.add(String(prof.id).trim().toLowerCase());
          if (prof?.email) usersWithGroupSet.add(String(prof.email).trim().toLowerCase());
        }
      }
    });

    // C. Incluir además los perfiles de estudiantes registrados que aún NO estén en ningún grupo
    perfilesList.forEach(p => {
      const pId = String(p.id || '').trim().toLowerCase();
      const pEmail = String(p.email || '').trim().toLowerCase();
      const hasGroup = usersWithGroupSet.has(pId) || (pEmail && usersWithGroupSet.has(pEmail));
      if (!hasGroup) {
        addStudentAssignment(p.id || p.email, null, 1);
      }
    });

    const finalStudentsList = Array.from(studentsMap.values());

    // Ordenar alfabéticamente
    finalStudentsList.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    return Response.json(finalStudentsList);
  }

  if (groupId) {
    const numGroupId = parseInt(groupId, 10);
    let guUsers = [];
    try {
      const { results } = await env.DB.prepare(
        'SELECT user_id FROM grupos_usuario WHERE group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?'
      ).bind(isNaN(numGroupId) ? groupId : numGroupId, groupId, groupId).all();
      guUsers = (results || []).map(r => r.user_id).filter(Boolean);
    } catch {}

    let inscUsers = [];
    try {
      const { results } = await env.DB.prepare(
        'SELECT user_id FROM inscripciones WHERE group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?'
      ).bind(isNaN(numGroupId) ? groupId : numGroupId, groupId, groupId).all();
      inscUsers = (results || []).map(r => r.user_id).filter(Boolean);
    } catch {}

    let perfilesList = [];
    try {
      const { results } = await env.DB.prepare('SELECT id, email, full_name, avatar_url FROM perfiles').all();
      perfilesList = results || [];
    } catch {}

    let solicitudesList = [];
    try {
      const { results } = await env.DB.prepare('SELECT id, name, email FROM solicitudes_acceso').all();
      solicitudesList = results || [];
    } catch {}

    const allTargetUserIds = Array.from(new Set([...guUsers, ...inscUsers]));

    const profileLookup = (targetUserId) => {
      if (!targetUserId) return null;
      const tid = String(targetUserId).trim().toLowerCase();
      const p = perfilesList.find(item => {
        const iId = String(item.id || '').trim().toLowerCase();
        const iEmail = String(item.email || '').trim().toLowerCase();
        return iId === tid || iEmail === tid || (iEmail && tid.includes(iEmail)) || (iId && tid.includes(iId));
      });
      if (p) return { id: p.id, email: p.email, full_name: p.full_name, avatar_url: p.avatar_url };

      const req = solicitudesList.find(item => {
        const rId = String(item.id || '').trim().toLowerCase();
        const rEmail = String(item.email || '').trim().toLowerCase();
        const rName = String(item.name || '').trim().toLowerCase();
        return rId === tid || rEmail === tid || (rEmail && tid.includes(rEmail)) || (rId && tid.includes(rId)) || rName === tid;
      });
      if (req) return { id: req.id || req.email, email: req.email, full_name: req.name || req.email, avatar_url: null };

      return {
        id: targetUserId,
        email: targetUserId.includes('@') ? targetUserId : '',
        full_name: targetUserId.includes('@') ? targetUserId.split('@')[0].replace(/[._-]/g, ' ') : targetUserId,
        avatar_url: null
      };
    };

    const groupStudents = allTargetUserIds.map(uid => profileLookup(uid)).filter(Boolean);
    groupStudents.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    return Response.json(groupStudents);
  }

  if (courseId) {
    const numId = parseInt(courseId, 10);
    const { results } = await env.DB.prepare(
      `SELECT g.id, g.course_id, g.name, g.teacher, COALESCE(g.is_active, 1) AS is_active, COUNT(gu.user_id) AS studentCount
       FROM grupos g
       LEFT JOIN grupos_usuario gu ON gu.group_id = g.id
       WHERE g.course_id = ? OR g.course_id = ? OR CAST(g.course_id AS TEXT) = ?
       GROUP BY g.id` 
    ).bind(isNaN(numId) ? courseId : numId, courseId, courseId).all();

    return Response.json(results);
  }

  const { results } = await env.DB.prepare(
    `SELECT g.id, g.course_id, g.name, g.teacher, COALESCE(g.is_active, 1) AS is_active, COUNT(gu.user_id) AS studentCount, COUNT(gu.user_id) AS total
     FROM grupos g
     LEFT JOIN grupos_usuario gu ON gu.group_id = g.id
     GROUP BY g.id`
  ).all();

  return Response.json(results);
}

export async function onRequestPost({ request, env, data }) {
  await ensureGroupsSchema(env);

  const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(data.user?.role);
  if (!isStaff) {
    return Response.json({ error: 'Solo administradores o docentes' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, course_id, name, teacher, is_active } = body;
  if (!name && id === undefined) {
    return Response.json({ error: 'Falta el nombre del grupo' }, { status: 400 });
  }

  if (id) {
    // Obtener datos del grupo previo para sincronizar cambios de nombre
    const oldGroup = await env.DB.prepare('SELECT * FROM grupos WHERE id = ?').bind(id).first();

    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : undefined;

    await env.DB.prepare(
      `UPDATE grupos SET
         name = COALESCE(?, name),
         teacher = COALESCE(?, teacher),
         is_active = COALESCE(?, is_active, 1)
       WHERE id = ?`
    ).bind(name ?? null, teacher ?? null, activeVal !== undefined ? activeVal : null, id).run();

    // Si el nombre del grupo cambió, actualizar en cascada la tabla usuarios y perfiles
    if (oldGroup && oldGroup.name && name && oldGroup.name !== name) {
      try {
        await env.DB.prepare('UPDATE usuarios SET group_name = ? WHERE group_name = ?').bind(name, oldGroup.name).run();
      } catch (e) {
        console.warn('No se pudo actualizar group_name en usuarios:', e);
      }
      try {
        await env.DB.prepare('UPDATE perfiles SET group_name = ? WHERE group_name = ?').bind(name, oldGroup.name).run();
      } catch (e) {
        console.warn('No se pudo actualizar group_name en perfiles:', e);
      }
    }

    const row = await env.DB.prepare('SELECT id, course_id, name, teacher, COALESCE(is_active, 1) AS is_active FROM grupos WHERE id = ?').bind(id).first();
    return Response.json(row);
  }

  if (!course_id) {
    return Response.json({ error: 'Falta el course_id' }, { status: 400 });
  }

  const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;

  const { meta } = await env.DB.prepare(
    `INSERT INTO grupos (course_id, name, teacher, is_active)
     VALUES (?, ?, ?, ?)`
  ).bind(course_id, name, teacher ?? null, activeVal).run();

  const row = await env.DB.prepare('SELECT id, course_id, name, teacher, COALESCE(is_active, 1) AS is_active FROM grupos WHERE id = ?').bind(meta.last_row_id).first();
  return Response.json(row);
}

export async function onRequestPatch({ request, env, data }) {
  await ensureGroupsSchema(env);

  const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(data.user?.role);
  if (!isStaff) {
    return Response.json({ error: 'Solo administradores o docentes' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { action, group_id, old_group_id, new_group_id, user_id, course_id } = body;

  // Acción 1: Transferir estudiante de un grupo a otro
  if (action === 'transfer_student' || (new_group_id && user_id)) {
    const targetGroupId = new_group_id || group_id;
    const fromGroupId = old_group_id;

    if (!targetGroupId || !user_id) {
      return Response.json({ error: 'Faltan target_group_id o user_id para la transferencia' }, { status: 400 });
    }

    const numNewGroupId = parseInt(targetGroupId, 10);
    const numOldGroupId = fromGroupId ? parseInt(fromGroupId, 10) : null;

    // 1. Eliminar vinculación del grupo anterior si está especificado
    if (fromGroupId) {
      await env.DB.prepare(
        `DELETE FROM grupos_usuario WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
      ).bind(isNaN(numOldGroupId) ? fromGroupId : numOldGroupId, fromGroupId, fromGroupId, user_id).run();

      await env.DB.prepare(
        `DELETE FROM inscripciones WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
      ).bind(isNaN(numOldGroupId) ? fromGroupId : numOldGroupId, fromGroupId, fromGroupId, user_id).run();
    }

    // 2. Insertar nueva vinculación en grupos_usuario
    await env.DB.prepare(
      `INSERT OR IGNORE INTO grupos_usuario (group_id, user_id) VALUES (?, ?)`
    ).bind(isNaN(numNewGroupId) ? targetGroupId : numNewGroupId, user_id).run();

    // 3. Obtener datos del nuevo grupo para actualizar nombre en usuarios/perfiles y registrar inscripción
    const newGroup = await env.DB.prepare('SELECT id, course_id, name FROM grupos WHERE id = ?').bind(targetGroupId).first();
    const effectiveCourseId = course_id || newGroup?.course_id || 1;
    const numCourseId = parseInt(effectiveCourseId, 10);

    if (newGroup) {
      try {
        await env.DB.prepare('UPDATE usuarios SET group_name = ? WHERE id = ? OR email = ?').bind(newGroup.name, user_id, user_id).run();
      } catch {}
      try {
        await env.DB.prepare('UPDATE perfiles SET group_name = ? WHERE id = ? OR email = ?').bind(newGroup.name, user_id, user_id).run();
      } catch {}

      // Registrar o actualizar inscripción con el nuevo group_id
      await env.DB.prepare(
        `INSERT INTO inscripciones (user_id, course_id, group_id)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, course_id) DO UPDATE SET group_id = excluded.group_id`
      ).bind(user_id, isNaN(numCourseId) ? effectiveCourseId : numCourseId, isNaN(numNewGroupId) ? targetGroupId : numNewGroupId).run();
    }

    return Response.json({ success: true, message: 'Estudiante transferido con éxito', new_group: newGroup });
  }

  // Acción 2: Desvincular estudiante
  if (!group_id || !user_id) {
    return Response.json({ error: 'Faltan group_id o user_id' }, { status: 400 });
  }

  const numGroupId = parseInt(group_id, 10);
  await env.DB.prepare(
    `DELETE FROM grupos_usuario WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
  ).bind(isNaN(numGroupId) ? group_id : numGroupId, group_id, group_id, user_id).run();

  await env.DB.prepare(
    `DELETE FROM inscripciones WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
  ).bind(isNaN(numGroupId) ? group_id : numGroupId, group_id, group_id, user_id).run();

  if (course_id) {
    const numCourseId = parseInt(course_id, 10);
    await env.DB.prepare(
      `DELETE FROM inscripciones WHERE (course_id = ? OR course_id = ? OR CAST(course_id AS TEXT) = ?) AND user_id = ?`
    ).bind(isNaN(numCourseId) ? course_id : numCourseId, course_id, course_id, user_id).run();
  }

  return Response.json({ success: true });
}

export async function onRequestDelete({ request, env, data }) {
  await ensureGroupsSchema(env);

  const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(data.user?.role);
  if (!isStaff) {
    return Response.json({ error: 'Solo administradores o docentes' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const userId = url.searchParams.get('user_id');
  const groupId = url.searchParams.get('group_id') || id;
  const courseId = url.searchParams.get('course_id');

  // Si viene user_id, desvincular al estudiante
  if (userId && groupId) {
    const numGroupId = parseInt(groupId, 10);
    await env.DB.prepare(
      `DELETE FROM grupos_usuario WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
    ).bind(isNaN(numGroupId) ? groupId : numGroupId, groupId, groupId, userId).run();

    await env.DB.prepare(
      `DELETE FROM inscripciones WHERE (group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?) AND user_id = ?`
    ).bind(isNaN(numGroupId) ? groupId : numGroupId, groupId, groupId, userId).run();

    if (courseId) {
      const numCourseId = parseInt(course_id, 10);
      await env.DB.prepare(
        `DELETE FROM inscripciones WHERE (course_id = ? OR course_id = ? OR CAST(course_id AS TEXT) = ?) AND user_id = ?`
      ).bind(isNaN(numCourseId) ? course_id : numCourseId, course_id, course_id, userId).run();
    }

    return Response.json({ success: true, removed_user_id: userId });
  }

  if (!id) {
    return Response.json({ error: 'Falta el id' }, { status: 400 });
  }

  const numId = parseInt(id, 10);
  await env.DB.prepare(
    'DELETE FROM grupos_usuario WHERE group_id = ? OR group_id = ? OR CAST(group_id AS TEXT) = ?'
  ).bind(isNaN(numId) ? id : numId, id, id).run();

  await env.DB.prepare(
    'DELETE FROM grupos WHERE id = ? OR id = ? OR CAST(id AS TEXT) = ?'
  ).bind(isNaN(numId) ? id : numId, id, id).run();

  return Response.json({ success: true, deleted_id: id });
}

async function ensureGroupsSchema(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      name TEXT NOT NULL,
      teacher TEXT,
      is_active INTEGER DEFAULT 1
    )
  `).run();

  try {
    await env.DB.prepare('ALTER TABLE grupos ADD COLUMN is_active INTEGER DEFAULT 1').run();
  } catch {
    // Columna ya existe
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS grupos_usuario (
      user_id TEXT,
      group_id INTEGER,
      PRIMARY KEY (user_id, group_id)
    )
  `).run();
}
