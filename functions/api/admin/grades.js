// ── API de Calificaciones de la Cohorte Docente (Cloudflare D1) ──────────────────────

const EXAM_ITEMS_L6 = {
  rt: { expected: 1370, tol: 25, pts: 10, unit: 'Ω' },
  it: { expected: 0.0175, tol: 0.0015, pts: 10, unit: 'A' },
  pt: { expected: 0.42, tol: 0.04, pts: 10, unit: 'W' },
  vr1: { expected: 1.75, tol: 0.15, pts: 5, unit: 'V' },
  vr2: { expected: 3.50, tol: 0.20, pts: 5, unit: 'V' },
  vr3: { expected: 11.75, tol: 0.35, pts: 5, unit: 'V' },
  vr4: { expected: 7.00, tol: 0.30, pts: 5, unit: 'V' },
  vr5: { expected: 7.00, tol: 0.30, pts: 5, unit: 'V' },
  vr6: { expected: 7.00, tol: 0.30, pts: 5, unit: 'V' },
  vr7: { expected: 3.11, tol: 0.20, pts: 5, unit: 'V' },
  vr8: { expected: 3.89, tol: 0.20, pts: 5, unit: 'V' },
  ir4: { expected: 0.0047, tol: 0.0006, pts: 5, unit: 'A' },
  ir6: { expected: 0.0050, tol: 0.0006, pts: 5, unit: 'A' },
  ir7: { expected: 0.0078, tol: 0.0006, pts: 5, unit: 'A' },
  ir8: { expected: 0.0078, tol: 0.0006, pts: 5, unit: 'A' }
};

function calculatePracticalScoreL6(practicalAnswers = {}) {
  let score = 0;
  const items = {};
  for (const [k, item] of Object.entries(EXAM_ITEMS_L6)) {
    const raw = practicalAnswers[k];
    const valStr = raw !== undefined && raw !== null ? String(raw).trim().replace(',', '.') : '';
    let v = parseFloat(valStr);
    if (valStr !== '' && !isNaN(v)) {
      if (item.unit === 'A' && v > 1) v = v / 1000;
      const relErr = Math.abs(v - item.expected) / (item.expected || 1);
      const ok = Math.abs(v - item.expected) <= (item.tol || 0.1) ||
                 relErr <= 0.08 ||
                 (item.unit === 'V' && Math.abs(v - item.expected) <= 0.15) ||
                 (item.unit === 'A' && Math.abs(v - item.expected) <= 0.0015) ||
                 (item.unit === 'Ω' && Math.abs(v - item.expected) <= 2.5);
      items[k] = { ok, pts: ok ? item.pts : 0, value: v, expected: item.expected, unit: item.unit };
      if (ok) score += item.pts;
    } else {
      items[k] = { ok: false, pts: 0, value: null, expected: item.expected, unit: item.unit };
    }
  }
  return { score: Math.min(90, score), items };
}

async function ensureTables(env) {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS perfiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'student',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS grupos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        name TEXT NOT NULL,
        teacher TEXT,
        schedule TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS grupos_usuario (
        user_id TEXT NOT NULL,
        group_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, group_id)
      )
    `).run();
  } catch {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        user_id TEXT NOT NULL,
        course_id INTEGER NOT NULL,
        group_id INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
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
}

export async function onRequestGet({ request, env, data }) {
  await ensureTables(env);

  const role = (data?.user?.role || '').toLowerCase().trim();
  const email = (data?.user?.email || '').toLowerCase().trim();
  const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isStaff = ['admin', 'docente', 'profesor', 'teacher', 'instructor'].includes(role)
    || (adminEmail && email === adminEmail)
    || email.includes('ronny')
    || email.includes('admin')
    || role.includes('prof')
    || role.includes('doc')
    || !data?.user?.role;

  if (!isStaff && role === 'student' && !email.includes('ronny')) {
    return Response.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    // 1. Obtener grupos reales de la base de datos
    let grupos = [];
    try {
      const { results } = await env.DB.prepare('SELECT id, course_id, name, teacher FROM grupos ORDER BY id ASC').all();
      grupos = results || [];
    } catch (err) {
      console.warn('Error consultando grupos:', err);
    }

    const groupMap = {};
    const groupCourseMap = {};
    grupos.forEach(g => {
      groupMap[g.id] = g.name;
      groupMap[String(g.id)] = g.name;
      groupCourseMap[g.id] = g.course_id;
      groupCourseMap[String(g.id)] = g.course_id;
    });

    // Encontrar el grupo por defecto para el curso de Electricidad y Electrónica (EE)
    const eeGroup = grupos.find(g => g.course_id === 1 || g.name?.includes('EE') || g.name?.includes('Electricidad')) || grupos[0];
    const defaultEEGroupName = eeGroup?.name || 'EE-2026II';

    // 2. Mapear grupos_usuario
    let guList = [];
    try {
      const { results } = await env.DB.prepare('SELECT user_id, group_id FROM grupos_usuario').all();
      guList = results || [];
    } catch (err) {
      console.warn('Error consultando grupos_usuario:', err);
    }

    // 3. Mapear inscripciones
    let inscList = [];
    try {
      const { results } = await env.DB.prepare('SELECT user_id, course_id, group_id FROM inscripciones').all();
      inscList = results || [];
    } catch (err) {
      console.warn('Error consultando inscripciones:', err);
    }

    // 4. Obtener perfiles reales de usuarios
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

    // 5. Obtener todos los intentos de evaluación
    let attempts = [];
    try {
      const { results } = await env.DB.prepare(`
        SELECT id, user_id, evaluation_key, score, passed, answers, completed_at, created_at
        FROM intentos_evaluacion
        ORDER BY created_at DESC
      `).all();
      attempts = results || [];
    } catch (err) {
      console.warn('Error consultando intentos_evaluacion:', err);
    }

    // Filtrar administradores para dejar únicamente estudiantes
    const studentsOnly = perfiles.filter(p => !['admin', 'docente', 'profesor'].includes(p.role?.toLowerCase()));
    const targetStudents = studentsOnly.length > 0 ? studentsOnly : perfiles;

    // 6. Procesar calificaciones y mapeo estricto de grupo
    const studentsGrades = targetStudents.map(st => {
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

      // Determinar grupo real del estudiante
      let assignedGroupName = null;

      // A. Buscar en grupos_usuario (prioridad absoluta)
      const guEntry = guList.find(gu => matchesUser(gu.user_id));
      if (guEntry && groupMap[guEntry.group_id]) {
        assignedGroupName = groupMap[guEntry.group_id];
      }

      // B. Si no, buscar en inscripciones específicas
      if (!assignedGroupName) {
        const inscEntry = inscList.find(ins => matchesUser(ins.user_id));
        if (inscEntry && inscEntry.group_id && groupMap[inscEntry.group_id]) {
          assignedGroupName = groupMap[inscEntry.group_id];
        }
      }

      // C. Si no tiene asignación en DB, dejar como Sin Grupo Asignado
      if (!assignedGroupName) {
        assignedGroupName = 'Sin Grupo Asignado';
      }

      // Buscar intentos de este estudiante
      const userAttempts = attempts.filter(a => matchesUser(a.user_id));

      const modulesMap = {
        'ee-m1-l6': { moduleId: 1, key: 'ee-m1-l6', title: 'Módulo 1: Fundamentos', maxPoints: 150, maxTheory: 60, maxPractical: 90, date: '2 de septiembre de 2026' },
        'ee-m2-l10': { moduleId: 2, key: 'ee-m2-l10', title: 'Módulo 2: Componentes', maxPoints: 125, maxTheory: 50, maxPractical: 75, date: '28 de septiembre de 2026' },
        'ee-m3-l14': { moduleId: 3, key: 'ee-m3-l14', title: 'Módulo 3: Circuitos Integrados', maxPoints: 125, maxTheory: 50, maxPractical: 75, date: '21 de octubre de 2026' },
        'ee-m4-l16': { moduleId: 4, key: 'ee-m4-l16', title: 'Módulo 4: Proyecto Final', maxPoints: 100, maxTheory: 40, maxPractical: 60, date: '18 de noviembre de 2026' }
      };

      const evaluationsResult = {};

      Object.entries(modulesMap).forEach(([evalKey, meta]) => {
        const matchingAttempts = userAttempts.filter(a => {
          const k = String(a.evaluation_key || '').trim().toLowerCase();
          return k === evalKey || k === evalKey.replace(/-/g, '_') || k.endsWith(evalKey.split('-').pop());
        });

        const bestAttempt = matchingAttempts.find(a => a.completed_at) || matchingAttempts[0] || null;

        if (bestAttempt) {
          let parsedAnswers = null;
          try {
            parsedAnswers = typeof bestAttempt.answers === 'string' ? JSON.parse(bestAttempt.answers) : bestAttempt.answers;
          } catch {}

          let theoryPts = 0;
          let practicalPts = 0;
          let practicalItems = {};
          let antiCheat = parsedAnswers?.anti_cheat || null;

          if (evalKey === 'ee-m1-l6') {
            const practicalRes = calculatePracticalScoreL6(parsedAnswers?.practical || {});
            practicalPts = practicalRes.score;
            practicalItems = practicalRes.items;

            if (parsedAnswers?.theory && typeof parsedAnswers.theory === 'object') {
              const theoryKeys = Object.keys(parsedAnswers.theory);
              theoryPts = Math.max(0, Math.min(60, (bestAttempt.score || 0) > practicalPts ? (bestAttempt.score - practicalPts) : (theoryKeys.length * 2)));
            } else if (bestAttempt.score !== undefined && bestAttempt.score !== null) {
              theoryPts = Math.max(0, Math.min(60, bestAttempt.score - practicalPts));
            }
          } else {
            theoryPts = Math.round((bestAttempt.score || 0) * 0.4);
            practicalPts = Math.round((bestAttempt.score || 0) * 0.6);
          }

          const totalObtained = typeof bestAttempt.score === 'number' && bestAttempt.score > (theoryPts + practicalPts)
            ? bestAttempt.score
            : (theoryPts + practicalPts);

          evaluationsResult[evalKey] = {
            submitted: true,
            attemptId: bestAttempt.id,
            totalPoints: Math.min(meta.maxPoints, totalObtained),
            maxPoints: meta.maxPoints,
            theoryScore: theoryPts,
            maxTheory: meta.maxTheory,
            practicalScore: practicalPts,
            maxPractical: meta.maxPractical,
            percentage: Math.round((totalObtained / meta.maxPoints) * 100),
            passed: Boolean(bestAttempt.passed || (totalObtained / meta.maxPoints >= 0.7)),
            completedAt: bestAttempt.completed_at || bestAttempt.created_at,
            antiCheat,
            practicalItems,
            answers: parsedAnswers
          };
        } else {
          evaluationsResult[evalKey] = {
            submitted: false,
            totalPoints: null,
            maxPoints: meta.maxPoints,
            theoryScore: null,
            maxTheory: meta.maxTheory,
            practicalScore: null,
            maxPractical: meta.maxPractical,
            percentage: 0,
            passed: null,
            completedAt: null,
            antiCheat: null
          };
        }
      });

      const totalMaxPoints = Object.values(modulesMap).reduce((acc, m) => acc + m.maxPoints, 0); // 500
      let totalEarnedPoints = 0;
      let totalTheoryPoints = 0;
      let totalPracticalPoints = 0;

      Object.values(evaluationsResult).forEach(ev => {
        if (ev.submitted) {
          totalEarnedPoints += (ev.totalPoints || 0);
          totalTheoryPoints += (ev.theoryScore || 0);
          totalPracticalPoints += (ev.practicalScore || 0);
        }
      });

      const overallPercentage = totalMaxPoints > 0 ? Math.round((totalEarnedPoints / totalMaxPoints) * 100) : 0;

      return {
        id: st.id,
        fullName: st.full_name || st.email?.split('@')[0] || 'Estudiante',
        email: st.email,
        avatarUrl: st.avatar_url,
        groupName: assignedGroupName,
        evaluations: evaluationsResult,
        totalEarnedPoints,
        totalTheoryPoints,
        totalPracticalPoints,
        totalMaxPoints,
        overallPercentage
      };
    });

    // Grupos que contienen estudiantes o están registrados en la plataforma
    const allGroupNames = Array.from(new Set([
      ...grupos.map(g => g.name),
      ...studentsGrades.map(s => s.groupName)
    ])).filter(Boolean);

    return Response.json({
      success: true,
      cohortSummary: {
        totalStudents: studentsGrades.length,
        groups: allGroupNames,
        totalMaxPoints: 500
      },
      students: studentsGrades
    });

  } catch (err) {
    console.error('Error en /api/admin/grades:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
