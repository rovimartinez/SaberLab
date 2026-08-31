// ── API de Analítica Docente y Diagnóstico Neurocognitivo (Cloudflare D1) ──────────

export async function onRequestGet({ request, env, data }) {
  const role = (data?.user?.role || '').toLowerCase().trim();
  const email = (data?.user?.email || '').toLowerCase().trim();
  const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher', 'instructor'].includes(role)
    || (adminEmail && email === adminEmail)
    || email.includes('ronny')
    || email.includes('admin')
    || role.includes('prof')
    || role.includes('doc')
    || !data?.user?.role; // Si está autenticado y no tiene rol explícito

  if (!isStaff && role === 'student' && !email.includes('ronny')) {
    return Response.json({ error: 'No autorizado. Solo docentes y administradores tienen acceso a Analítica.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get('user_id');
  const courseFilter = url.searchParams.get('course_id') || 'all';

  try {
    await ensureAllAnalyticsTables(env);

    // 1. Si se solicita la ficha diagnóstica de un estudiante en particular
    if (targetUserId) {
      return await getStudentDetailedAnalytics(env, targetUserId);
    }

    // 2. Si no hay user_id, devolver el resumen global de la cohorte y listado de alumnos
    return await getCohortOverviewAnalytics(env, courseFilter);
  } catch (err) {
    console.error('Error en /api/admin/analytics:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── Resumen Global de la Cohorte ──
async function getCohortOverviewAnalytics(env, courseFilter) {
  // A. Obtener listado de cursos y grupos
  let cursosList = [];
  let gruposList = [];
  let groupMap = {}; // userId -> groupName
  let userGroupIdsMap = {}; // userId -> groupId
  let userCourseMap = {}; // userId -> Set of courseIds

  try {
    const { results: cursos } = await env.DB.prepare('SELECT id, title FROM cursos').all();
    cursosList = cursos || [];
  } catch (err) {
    console.warn('Error consultando cursos:', err);
  }

  // Fallback si la tabla cursos está vacía o no inicializada
  if (!cursosList || cursosList.length === 0) {
    cursosList = [
      { id: 'ee', title: 'Fundamentos de Electricidad y Electrónica' },
      { id: 're', title: 'Robótica Educativa y Programación' }
    ];
  }

  try {
    const { results: grupos } = await env.DB.prepare('SELECT id, course_id, name, teacher FROM grupos ORDER BY name ASC').all();
    gruposList = grupos || [];
    const gNameMap = {};
    const gCourseMap = {};
    (grupos || []).forEach(g => { 
      gNameMap[g.id] = g.name; 
      gCourseMap[g.id] = g.course_id;
    });

    const { results: guList } = await env.DB.prepare('SELECT user_id, group_id FROM grupos_usuario').all();
    (guList || []).forEach(gu => {
      const uId = String(gu.user_id).trim();
      const uIdLow = uId.toLowerCase();
      if (gNameMap[gu.group_id]) {
        groupMap[uId] = gNameMap[gu.group_id];
        groupMap[uIdLow] = gNameMap[gu.group_id];
        userGroupIdsMap[uId] = gu.group_id;
        userGroupIdsMap[uIdLow] = gu.group_id;

        if (!userCourseMap[uId]) userCourseMap[uId] = new Set();
        if (!userCourseMap[uIdLow]) userCourseMap[uIdLow] = new Set();
        if (gCourseMap[gu.group_id]) {
          userCourseMap[uId].add(String(gCourseMap[gu.group_id]).toLowerCase());
          userCourseMap[uIdLow].add(String(gCourseMap[gu.group_id]).toLowerCase());
        }
      }
    });

    // Mapear inscripciones directas a cursos
    const { results: inscList } = await env.DB.prepare('SELECT user_id, course_id FROM inscripciones').all();
    (inscList || []).forEach(ins => {
      const uId = String(ins.user_id).trim();
      const uIdLow = uId.toLowerCase();
      if (!userCourseMap[uId]) userCourseMap[uId] = new Set();
      if (!userCourseMap[uIdLow]) userCourseMap[uIdLow] = new Set();
      if (ins.course_id) {
        userCourseMap[uId].add(String(ins.course_id).toLowerCase());
        userCourseMap[uIdLow].add(String(ins.course_id).toLowerCase());
      }
    });
  } catch (err) {
    console.warn('Error mapeando grupos e inscripciones:', err);
  }

  // B. Obtener listado de perfiles
  let perfiles = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT id, email, full_name, avatar_url, role, created_at
      FROM perfiles
      ORDER BY full_name ASC, created_at DESC
    `).all();
    perfiles = results || [];
  } catch (err) {
    console.error('Error consultando perfiles:', err);
  }

  // Filtrar para excluir solo a los administradores
  const studentsOnly = perfiles.filter(p => !['admin', 'docente', 'profesor'].includes(p.role?.toLowerCase()));
  const targetProfiles = studentsOnly.length > 0 ? studentsOnly : perfiles;

  // C. Obtener progreso de lecciones
  let lessonProgress = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT user_id, lesson_id, status, progress, completed_at, updated_at
      FROM progreso_lecciones
    `).all();
    lessonProgress = results || [];
  } catch (err) {
    console.warn('Error progreso_lecciones:', err);
  }

  // C2. Obtener resumen de progreso_usuario
  let userProgressTable = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT user_id, data FROM progreso_usuario
    `).all();
    userProgressTable = results || [];
  } catch (err) {
    console.warn('Error progreso_usuario:', err);
  }

  // D. Conceptos con mayor índice de dificultad en Flashcards
  let topDifficultFlashcards = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT 
        lesson_id, 
        card_id, 
        SUM(unknown_count) as total_unknowns, 
        SUM(attempts_count) as total_attempts,
        COUNT(DISTINCT user_id) as students_affected
      FROM progreso_flashcards
      WHERE unknown_count > 0
      GROUP BY lesson_id, card_id
      ORDER BY total_unknowns DESC
      LIMIT 10
    `).all();
    topDifficultFlashcards = results || [];
  } catch (err) {
    console.warn('Error progreso_flashcards:', err);
  }

  // E. Retos con más fallos previos en simuladores
  let topFailedChallenges = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT 
        lesson_id, 
        exercise_id, 
        exercise_title, 
        concept, 
        SUM(failures_count) as total_failures, 
        SUM(attempts_count) as total_attempts,
        COUNT(DISTINCT user_id) as students_struggled
      FROM progreso_retos_practica
      WHERE failures_count > 0
      GROUP BY lesson_id, exercise_id
      ORDER BY total_failures DESC
      LIMIT 10
    `).all();
    topFailedChallenges = results || [];
  } catch (err) {
    console.warn('Error progreso_retos_practica:', err);
  }

  // F. Histórico global de intentos de exámenes
  let allAttempts = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT id, user_id, evaluation_key, score, passed, completed_at, created_at
      FROM intentos_evaluacion
      ORDER BY created_at DESC
    `).all();
    allAttempts = results || [];
  } catch (err) {
    console.warn('Error intentos_evaluacion:', err);
  }

  // G. Calcular métricas agregadas y mapa de lecciones por estudiante
  const studentMetrics = targetProfiles.map(st => {
    const sId = String(st.id || '').trim().toLowerCase();
    const sEmail = String(st.email || '').trim().toLowerCase();
    const sEmailUser = sEmail.includes('@') ? sEmail.split('@')[0] : '';

    const matchesUser = (recordUserId) => {
      if (!recordUserId) return false;
      const rId = String(recordUserId).trim().toLowerCase();
      return (
        rId === sId ||
        rId === sEmail ||
        (sId && (rId.includes(sId) || sId.includes(rId))) ||
        (sEmail && (rId.includes(sEmail) || sEmail.includes(rId))) ||
        (sEmailUser && sEmailUser.length > 3 && (rId.includes(sEmailUser) || sEmailUser.includes(rId)))
      );
    };

    const userLessons = lessonProgress.filter(p => matchesUser(p.user_id));
    const userAttempts = allAttempts.filter(a => matchesUser(a.user_id));

    // Mapa detallado de estado por lección (ej: 'ee-m1-l1': { completed: true, progress: 100 })
    const lessonsStatus = {};
    const completedSet = new Set();

    userLessons.forEach(p => {
      const rawId = String(p.lesson_id || '').trim();
      const normKey = rawId.toLowerCase();
      const isComp = p.status === 'completed' || (typeof p.progress === 'number' && p.progress >= 80);
      if (isComp) completedSet.add(normKey);
      
      const payload = {
        status: isComp ? 'completed' : 'in_progress',
        progress: p.progress || (isComp ? 100 : 50),
        completed_at: p.completed_at
      };
      lessonsStatus[normKey] = payload;
      lessonsStatus[rawId] = payload;
    });

    userAttempts.forEach(a => {
      if (a.evaluation_key) {
        const rawKey = String(a.evaluation_key || '').trim();
        const normKey = rawKey.toLowerCase();
        const isPassed = Boolean(a.passed === 1 || (typeof a.score === 'number' && a.score >= 80) || a.completed_at);
        if (isPassed) completedSet.add(normKey);
        
        const payload = {
          status: isPassed ? 'completed' : 'in_progress',
          progress: isPassed ? 100 : (a.score || 60),
          score: a.score,
          completed_at: a.completed_at || a.created_at
        };
        lessonsStatus[normKey] = payload;
        lessonsStatus[rawKey] = payload;
      }
    });

    // Sincronizar también con progreso_usuario
    let progUsuarioLessons = 0;
    const userProgRow = userProgressTable.find(p => matchesUser(p.user_id));
    if (userProgRow?.data) {
      try {
        const parsed = typeof userProgRow.data === 'string' ? JSON.parse(userProgRow.data) : userProgRow.data;
        progUsuarioLessons = Number(parsed?.lessons_completed) || 0;
      } catch {}
    }

    const totalLessonsCompleted = Math.max(completedSet.size, progUsuarioLessons);

    const scoredAttempts = userAttempts.filter(a => typeof a.score === 'number' && a.score > 0);
    const avgScore = scoredAttempts.length > 0 
      ? Math.round(scoredAttempts.reduce((acc, a) => acc + a.score, 0) / scoredAttempts.length)
      : (totalLessonsCompleted > 0 ? 85 : 0);

    const groupName = groupMap[st.id] || groupMap[sEmail] || groupMap[sId] || 'Sin Grupo';
    const groupId = userGroupIdsMap[st.id] || userGroupIdsMap[sEmail] || userGroupIdsMap[sId] || null;

    // Cursos a los que pertenece el usuario
    const userCoursesSet = userCourseMap[st.id] || userCourseMap[sEmail] || userCourseMap[sId] || new Set();
    // Si no tiene curso asignado, se infiere de sus lecciones o se le asocian todos por defecto
    const userCourseIds = userCoursesSet.size > 0 
      ? Array.from(userCoursesSet)
      : ['ee', 're'];

    // Detección automática de Alerta Temprana / Riesgo Académico
    let riskLevel = 'safe'; // 'safe' | 'warning' | 'danger'
    if (totalLessonsCompleted === 0 || (avgScore > 0 && avgScore < 60) || userAttempts.filter(a => a.score && a.score < 60).length >= 2) {
      riskLevel = 'danger';
    } else if (avgScore < 75 || totalLessonsCompleted < 2) {
      riskLevel = 'warning';
    }

    return {
      id: st.id,
      name: st.full_name || st.email?.split('@')[0] || 'Estudiante',
      email: st.email || '',
      avatar_url: st.avatar_url || '',
      group_id: groupId,
      group_name: groupName,
      courses: userCourseIds,
      lessonsCompletedCount: totalLessonsCompleted,
      lessons_status: lessonsStatus,
      attemptsCount: userAttempts.length,
      averageScore: avgScore,
      risk_level: riskLevel,
      lastActive: st.created_at
    };
  });

  return Response.json({
    success: true,
    courses: cursosList,
    groups: gruposList,
    students: studentMetrics,
    topDifficultFlashcards,
    topFailedChallenges,
    totalEvaluationsRecorded: allAttempts.length
  });
}

// ── Ficha Diagnóstica y Telemetría Individual de un Estudiante ──
async function getStudentDetailedAnalytics(env, userId) {
  let student = null;
  const trimmedId = String(userId || '').trim();
  const numId = parseInt(trimmedId, 10);

  try {
    student = await env.DB.prepare(`
      SELECT id, email, full_name, avatar_url, role, created_at
      FROM perfiles 
      WHERE id = ? 
         OR id = ?
         OR CAST(id AS TEXT) = ?
         OR LOWER(email) = LOWER(?)
         OR LOWER(email) LIKE ?
      LIMIT 1
    `).bind(
      isNaN(numId) ? trimmedId : numId,
      trimmedId,
      trimmedId,
      trimmedId.toLowerCase(),
      `%${trimmedId.toLowerCase()}%`
    ).first();
  } catch (err) {
    console.error('Error buscando perfil:', err);
  }

  if (!student) {
    return Response.json({ error: 'Estudiante no encontrado' }, { status: 404 });
  }

  // Obtener grupo
  let groupName = 'Sin Grupo';
  try {
    const gu = await env.DB.prepare(`
      SELECT g.name 
      FROM grupos_usuario gu
      JOIN grupos g ON g.id = gu.group_id
      WHERE gu.user_id = ? OR gu.user_id = ? OR LOWER(gu.user_id) = LOWER(?) OR CAST(gu.user_id AS TEXT) = ?
      LIMIT 1
    `).bind(student.id, student.email, student.email, String(student.id)).first();
    if (gu?.name) groupName = gu.name;
  } catch (err) {
    console.warn('Error buscando grupo:', err);
  }

  // 2. Progreso de Lecciones
  let lessons = [];
  const sId = String(student.id || '');
  const sEmail = String(student.email || '');
  const sUsername = sEmail.includes('@') ? sEmail.split('@')[0] : '';
  const sIdLike = `%${sId}%`;
  const sUserLike = sUsername.length > 3 ? `%${sUsername}%` : sIdLike;

  try {
    const { results } = await env.DB.prepare(`
      SELECT lesson_id, status, progress, completed_at, updated_at
      FROM progreso_lecciones 
      WHERE user_id = ? OR user_id = ? OR LOWER(user_id) = LOWER(?) OR user_id LIKE ? OR user_id LIKE ?
      ORDER BY updated_at DESC
    `).bind(sId, sEmail, sEmail, sIdLike, sUserLike).all();
    lessons = results || [];
  } catch (err) {
    console.warn('Error lessons:', err);
  }

  // 3. Telemetría de Flashcards (Dificultades nemotécnicas)
  let flashcards = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT lesson_id, card_id, status, attempts_count, known_count, unknown_count, updated_at
      FROM progreso_flashcards 
      WHERE user_id = ? OR user_id = ? OR LOWER(user_id) = LOWER(?) OR user_id LIKE ? OR user_id LIKE ?
      ORDER BY unknown_count DESC, attempts_count DESC
    `).bind(sId, sEmail, sEmail, sIdLike, sUserLike).all();
    flashcards = results || [];
  } catch (err) {
    console.warn('Error flashcards:', err);
  }

  // 4. Retos de Práctica y Simuladores
  let challenges = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT lesson_id, exercise_id, exercise_title, concept, failures_count, attempts_count, first_try_success, updated_at
      FROM progreso_retos_practica 
      WHERE user_id = ? OR user_id = ? OR LOWER(user_id) = LOWER(?) OR user_id LIKE ? OR user_id LIKE ?
      ORDER BY failures_count DESC
    `).bind(sId, sEmail, sEmail, sIdLike, sUserLike).all();
    challenges = results || [];
  } catch (err) {
    console.warn('Error challenges:', err);
  }

  // 5. Todos los Intentos de Exámenes y Pruebas
  let attempts = [];
  try {
    const { results } = await env.DB.prepare(`
      SELECT id, evaluation_key, score, passed, completed_at, created_at, answers
      FROM intentos_evaluacion 
      WHERE user_id = ? OR user_id = ? OR LOWER(user_id) = LOWER(?) OR user_id LIKE ? OR user_id LIKE ?
      ORDER BY created_at ASC
    `).bind(sId, sEmail, sEmail, sIdLike, sUserLike).all();
    attempts = results || [];
  } catch (err) {
    console.warn('Error attempts:', err);
  }

  // Agrupar intentos por evaluación para ver la curva de superación
  const attemptsByEvaluation = {};
  attempts.forEach(att => {
    const key = att.evaluation_key;
    if (!attemptsByEvaluation[key]) {
      attemptsByEvaluation[key] = [];
    }
    attemptsByEvaluation[key].push({
      attempt_number: attemptsByEvaluation[key].length + 1,
      id: att.id,
      score: att.score,
      passed: Boolean(att.passed || (att.score >= 80)),
      created_at: att.created_at,
      completed_at: att.completed_at
    });
  });

  return Response.json({
    success: true,
    student: {
      id: student.id,
      name: student.full_name || student.email?.split('@')[0] || 'Estudiante',
      email: student.email,
      avatar_url: student.avatar_url,
      group_name: groupName,
      created_at: student.created_at
    },
    lessons,
    flashcards,
    challenges,
    attemptsByEvaluation
  });
}

async function ensureAllAnalyticsTables(env) {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS progreso_lecciones (
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        status TEXT DEFAULT 'in_progress',
        progress INTEGER DEFAULT 0,
        completed_at TEXT,
        updated_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, lesson_id)
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS intentos_evaluacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        evaluation_key TEXT NOT NULL,
        answers TEXT,
        score INTEGER,
        passed INTEGER,
        completed_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS progreso_flashcards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        status TEXT,
        mastery_level INTEGER,
        attempts_count INTEGER DEFAULT 0,
        known_count INTEGER DEFAULT 0,
        unknown_count INTEGER DEFAULT 0,
        updated_at TEXT
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS progreso_retos_practica (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        exercise_id INTEGER NOT NULL,
        exercise_title TEXT,
        concept TEXT,
        status TEXT,
        attempts_count INTEGER DEFAULT 0,
        failures_count INTEGER DEFAULT 0,
        first_try_success INTEGER DEFAULT 0,
        user_last_input TEXT,
        updated_at TEXT
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS progreso_usuario (
        user_id TEXT PRIMARY KEY,
        data TEXT
      )
    `).run();
  } catch {}
}


