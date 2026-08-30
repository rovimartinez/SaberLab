// ── API de Progreso General y Estadísticas (Cloudflare D1) ──────────────────────

export async function onRequestGet({ env, data }) {
  const userId = data.user.id;

  // 1. Asegurar tablas necesarias
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

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS intentos_evaluacion (
      id TEXT PRIMARY KEY,
      evaluation_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      score REAL DEFAULT 0,
      max_score REAL DEFAULT 100,
      grade REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in_progress',
      answers TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      finished_at TEXT
    )
  `).run();

  try {
    // 2. Obtener todas las lecciones completadas por el usuario
    const { results: completedLessons } = await env.DB.prepare(
      "SELECT lesson_id, status, progress, updated_at FROM progreso_lecciones WHERE user_id = ? AND (status = 'completed' OR progress = 100)"
    ).bind(userId).all();

    const completedLessonIds = (completedLessons || []).map(r => r.lesson_id);
    const lessonsCount = completedLessonIds.length;

    // 3. Obtener exámenes completados y acumulación de puntos (Cloudflare D1)
    const examStats = await env.DB.prepare(
      "SELECT COUNT(*) as total_exams, SUM(COALESCE(score, 0)) as total_points, AVG(score) as avg_grade, MAX(score) as max_score FROM intentos_evaluacion WHERE user_id = ? AND (completed_at IS NOT NULL OR score > 0)"
    ).bind(userId).first();

    const examsCompleted = examStats?.total_exams || 0;
    const totalPoints = examStats?.total_points || 0;
    const averageGrade = examStats?.avg_grade ? Math.round(examStats.avg_grade * 10) / 10 : 0;
    const certificatesCount = totalPoints >= 450 ? 1 : 0;

    // 4. Calcular desglose por curso
    // Definición estándar de cursos y sus lecciones
    const courseStats = {
      re: { id: 5, abbr: 'RE', total: 17, completed: 0 },
      ee: { id: 1, abbr: 'EE', total: 16, completed: 0 },
      mq: { id: 3, abbr: 'MQ', total: 6, completed: 0 },
      ma: { id: 4, abbr: 'MA', total: 6, completed: 0 }
    };

    completedLessonIds.forEach(lid => {
      const lower = lid.toLowerCase();
      if (lower.startsWith('re-')) courseStats.re.completed++;
      else if (lower.startsWith('ee-')) courseStats.ee.completed++;
      else if (lower.startsWith('mq-')) courseStats.mq.completed++;
      else if (lower.startsWith('ma-')) courseStats.ma.completed++;
    });

    const coursesBreakdown = {
      1: { progress: Math.min(100, Math.round((courseStats.ee.completed / courseStats.ee.total) * 100)), completed: courseStats.ee.completed, total: courseStats.ee.total },
      5: { progress: Math.min(100, Math.round((courseStats.re.completed / courseStats.re.total) * 100)), completed: courseStats.re.completed, total: courseStats.re.total },
      3: { progress: Math.min(100, Math.round((courseStats.mq.completed / courseStats.mq.total) * 100)), completed: courseStats.mq.completed, total: courseStats.mq.total },
      4: { progress: Math.min(100, Math.round((courseStats.ma.completed / courseStats.ma.total) * 100)), completed: courseStats.ma.completed, total: courseStats.ma.total }
    };

    // 5. Calcular progreso general
    const totalPossibleLessons = courseStats.re.total + courseStats.ee.total;
    const overallProgress = totalPossibleLessons > 0 
      ? Math.min(100, Math.round((lessonsCount / totalPossibleLessons) * 100))
      : 0;

    // 6. Actividad y Racha
    // Estimación: 45 min por lección completada + 30 min por examen
    const estimatedHours = Math.round((lessonsCount * 0.75 + examsCompleted * 0.5) * 10) / 10;
    const streakDays = lessonsCount > 0 ? Math.max(1, Math.min(30, Math.ceil(lessonsCount / 2))) : 0;

    // 7. Distribución semanal simulada/calculada con base en actividad real
    const weeklyHours = [0, 0, 0, 0, 0, 0, 0];
    const todayIndex = (new Date().getDay() + 6) % 7; // 0=Lun ... 6=Dom
    if (lessonsCount > 0) {
      weeklyHours[todayIndex] = Math.min(4, Math.round((lessonsCount * 0.5) * 10) / 10);
    }

    return Response.json({
      overall_progress: overallProgress,
      lessons_completed: lessonsCount,
      completed_lesson_ids: completedLessonIds,
      streak_days: streakDays,
      total_hours: estimatedHours,
      exams_completed: examsCompleted,
      total_points: totalPoints,
      certificates: certificatesCount,
      average_grade: averageGrade,
      courses_progress: coursesBreakdown,
      weekly_hours: weeklyHours
    });
  } catch (err) {
    console.error('Error calculando progreso:', err);
    return Response.json({
      overall_progress: 0,
      lessons_completed: 0,
      completed_lesson_ids: [],
      streak_days: 0,
      total_hours: 0,
      exams_completed: 0,
      total_points: 0,
      certificates: 0,
      average_grade: 0,
      courses_progress: {},
      weekly_hours: [0, 0, 0, 0, 0, 0, 0]
    });
  }
}

export async function onRequestPost({ request, env, data }) {
  // Fallback para actualizaciones explícitas
  return Response.json({ success: true });
}
