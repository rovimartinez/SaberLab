import React, { useState, useEffect } from 'react';
import { 
    Calendar, AlarmClock, BookOpen, Clock, Target, ArrowRight, Play, 
    Zap, Bot, GraduationCap, Gamepad2, Award, User, Activity, TrendingUp, 
    Flame, CheckCircle2, Trophy, Sparkles, Shield, ChevronRight, Compass, Eye, CheckCircle, X, Lock, Gift, Wrench, Hash
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useApps } from '../context/useApps';
import { api } from '../lib/api';
import { COURSES_DEFINITION, getLessonInfo } from '../data/coursesData.jsx';
import { ranks, getRankByLessons, getNextRank, getRankProgress } from '../data/ranksData';
import '../styles/PanelInicio.css';

const getCourseIcon = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr || c.id === abbr);
    if (def?.icon) return def.icon;
    if (abbr === 'RE' || abbr === 'robotica') return <Bot size={22} />;
    if (abbr === 'EE' || abbr === 'electricidad') return <Zap size={22} />;
    return <GraduationCap size={22} />;
};

const getCourseColor = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr || c.id === abbr);
    return def?.color || '#38bdf8';
};

const PanelInicio = () => {
    const { user, profile, enrolledCourses, userProgress: cachedProgress, refreshUserProgress, lessonVisibility } = useAuth();
    const { openLauncher } = useApps();
    const navigate = useNavigate();
    
    const [userProgress, setUserProgress] = useState(cachedProgress);
    const [completedLessonsMap, setCompletedLessonsMap] = useState({});
    const [completedAttemptsMap, setCompletedAttemptsMap] = useState({});
    const [showRanksModal, setShowRanksModal] = useState(false);
    const [loading, setLoading] = useState(!cachedProgress);

    const userMetadata = user?.user_metadata || {};
    const fullName = profile?.full_name?.split(' ')[0] || userMetadata.full_name?.split(' ')[0] || userMetadata.name?.split(' ')[0] || 'Estudiante';

    useEffect(() => {
        if (cachedProgress) {
            setUserProgress(cachedProgress);
        }
    }, [cachedProgress]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            if (!cachedProgress) {
                const freshProg = await refreshUserProgress();
                if (freshProg) setUserProgress(freshProg);
            } else {
                setUserProgress(cachedProgress);
            }

            try {
                const [progRes, attRes] = await Promise.allSettled([
                    api('/lesson-progress'),
                    api('/attempts')
                ]);

                const lMap = {};
                if (progRes.status === 'fulfilled' && Array.isArray(progRes.value?.data)) {
                    progRes.value.data.forEach(item => {
                        if (item.status === 'completed' || item.progress === 100) {
                            lMap[item.lesson_id] = true;
                        }
                    });
                }

                const aMap = {};
                if (attRes.status === 'fulfilled' && Array.isArray(attRes.value?.data)) {
                    attRes.value.data.forEach(att => {
                        if (att.completed_at && att.evaluation_key) {
                            aMap[att.evaluation_key.toLowerCase()] = att;
                            lMap[att.evaluation_key.toLowerCase()] = true;
                        }
                    });
                }

                ['ee-m1-l6', 'ee-m2-l10', 'ee-m3-l14', 'ee-m4-l16'].forEach(key => {
                    const localData = localStorage.getItem(`exam_completed_${key}`);
                    if (localData) {
                        try {
                            const parsed = JSON.parse(localData);
                            aMap[key] = parsed;
                            lMap[key] = true;
                        } catch (e) {
                            aMap[key] = { points_obtained: 150 };
                            lMap[key] = true;
                        }
                    }
                });

                setCompletedLessonsMap(lMap);
                setCompletedAttemptsMap(aMap);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, [user, cachedProgress, refreshUserProgress]);

    const completedLessonsCount = Object.keys(completedLessonsMap).length;
    const lessonsCompleted = Math.max(userProgress?.lessons_completed || 0, completedLessonsCount);
    const streakDays = userProgress?.streak_days || (lessonsCompleted > 0 ? 1 : 0);
    
    // Rango y progresión STEAM
    const rank = getRankByLessons(lessonsCompleted);
    const nextRank = getNextRank(lessonsCompleted);
    const rankProgress = getRankProgress(lessonsCompleted);

    // Mapeo del curso activo
    const hasEnrolledCourses = (enrolledCourses && enrolledCourses.length > 0) || profile?.role === 'admin';
    const mainCourseDef = hasEnrolledCourses
        ? (COURSES_DEFINITION.find(d => d.id === enrolledCourses[0]?.id || d.abbr === enrolledCourses[0]?.abbr || d.id === enrolledCourses[0]?.slug) || enrolledCourses[0] || COURSES_DEFINITION[0])
        : COURSES_DEFINITION[0];

    const courseColor = mainCourseDef?.color || '#38bdf8';
    const courseIcon = mainCourseDef?.icon || <Zap size={22} />;
    const courseModules = mainCourseDef?.modules || [];
    const allCourseLessons = courseModules.flatMap(m => (m.lessons || []).map(l => ({ ...l, moduleId: m.id, moduleName: m.name })));
    const totalLessons = hasEnrolledCourses ? (allCourseLessons.length || 16) : 0;

    const courseCompletedCount = allCourseLessons.filter(l => 
        completedLessonsMap[l.id] || 
        completedLessonsMap[l.id.toLowerCase()] || 
        completedLessonsMap[`ee-${l.moduleId}-${l.id}`]
    ).length;

    const courseProgressPercent = totalLessons > 0 ? Math.round((courseCompletedCount / totalLessons) * 100) : 0;

    let nextLessonTarget = null;
    let lastCompletedLesson = null;

    for (const l of allCourseLessons) {
        const isDone = completedLessonsMap[l.id] || completedLessonsMap[l.id.toLowerCase()] || completedLessonsMap[`ee-${l.moduleId}-${l.id}`];
        const lessonInfo = getLessonInfo(l.id);
        if (isDone) {
            lastCompletedLesson = { ...l, title: lessonInfo?.title || l.id };
        } else if (!nextLessonTarget) {
            nextLessonTarget = { ...l, title: lessonInfo?.title || l.id };
        }
    }

    if (!nextLessonTarget && allCourseLessons.length > 0) {
        nextLessonTarget = allCourseLessons[0];
    }

    const nextLessonIsExam = nextLessonTarget?.id === 'ee-m1-l6' || nextLessonTarget?.id.endsWith('-l6') || nextLessonTarget?.id.endsWith('-l10') || nextLessonTarget?.id.endsWith('-l14') || nextLessonTarget?.id.endsWith('-l16');
    const nextLessonLink = nextLessonIsExam
        ? `/dashboard/evaluations/${nextLessonTarget.id}`
        : `/dashboard/my-courses/${mainCourseDef.slug || 'electricidad-y-electronica'}/${nextLessonTarget?.moduleId || 'm1'}/${nextLessonTarget?.id || 'ee-m1-l1'}`;

    // Actividad semanal real (0h para nuevos estudiantes)
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const todayIndex = new Date().getDay(); // 0=Dom, 1=Lun
    const weeklyHoursArr = userProgress?.weekly_hours || [0, 0, 0, 0, 0, 0, 0];
    const weeklyActivity = days.map((day, idx) => ({
        day,
        hours: weeklyHoursArr[idx] || 0,
        isToday: idx === (todayIndex === 0 ? 6 : todayIndex - 1)
    }));
    const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 1);
    const totalWeeklyHours = weeklyActivity.reduce((acc, d) => acc + d.hours, 0);
    const weeklyGoalHours = 5;
    const weeklyGoalPercent = Math.min(100, Math.round((totalWeeklyHours / weeklyGoalHours) * 100));

    // Telemetría práctica vs teoría real
    const practiceMins = userProgress?.practice_minutes || (lessonsCompleted * 20) || 0;
    const theoryMins = userProgress?.theory_minutes || (lessonsCompleted * 10) || 0;
    const totalMins = practiceMins + theoryMins;
    const practicePercent = totalMins > 0 ? Math.round((practiceMins / totalMins) * 100) : 0;
    const theoryPercent = totalMins > 0 ? (100 - practicePercent) : 0;

    const formatMins = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m < 10 ? '0' : ''}${m}m`;
    };

    // Próximas actividades dinámicas
    const upcomingActivities = [];
    enrolledCourses.forEach(c => {
        const def = COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr || d.id === c.slug) || c;
        const courseIdKey = def.id || c.id;
        const courseVis = (lessonVisibility && (lessonVisibility[courseIdKey] || lessonVisibility[String(courseIdKey)] || lessonVisibility[def.abbr])) || {};

        if (def.modules) {
            def.modules.forEach((m, idx) => {
                if (m.evaluation) {
                    const evalKey = m.evaluation.id || (idx === 0 ? 'ee-m1-l6' : `ee-m${idx + 1}-l${idx === 1 ? 10 : (idx === 2 ? 14 : 16)}`);
                    const isDone = !!(completedAttemptsMap[evalKey] || completedAttemptsMap[evalKey.toLowerCase()]);
                    const attempt = completedAttemptsMap[evalKey] || completedAttemptsMap[evalKey.toLowerCase()];
                    const pointsEarned = attempt ? (attempt.points_obtained ?? attempt.totalPts ?? attempt.score ?? m.evaluation.points) : m.evaluation.points;

                    // Un examen está bloqueado si el docente lo ocultó (false) o si es de un módulo futuro que no se ha habilitado explícitamente
                    const isExplicitlyLocked = courseVis[evalKey] === false || courseVis[evalKey.toLowerCase()] === false;
                    const isExplicitlyUnlocked = courseVis[evalKey] === true || courseVis[evalKey.toLowerCase()] === true;
                    // Si el docente lo bloqueó O si es un módulo futuro no habilitado
                    const isLocked = isExplicitlyLocked || (idx > 0 && !isExplicitlyUnlocked);

                    upcomingActivities.push({
                        id: `${def.id || def.slug}-${m.id}`,
                        evalKey,
                        title: m.evaluation.title,
                        course: def.name,
                        date: m.evaluation.date,
                        points: m.evaluation.points,
                        pointsEarned,
                        isDone,
                        isLocked,
                        type: 'Examen Oficial'
                    });
                }
            });
        }
    });

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

    const quickActions = [
        { label: 'Mi Perfil', icon: <User size={14} />, to: '/dashboard/profile' },
        ...(isStaff ? [{ label: 'Widgets', icon: <Wrench size={14} />, onClick: openLauncher }] : []),
        { label: 'Recompensas', icon: <Gift size={14} />, to: '/dashboard/gadgets' },
        { label: 'Calificaciones', icon: <Award size={14} />, to: '/dashboard/grades' },
    ];

    return (
        <div className="dashboard-symmetric-root">
            
            {/* ── 1. HEADER HERO (SIMÉTRICO Y PROFESIONAL) ── */}
            <div className="hero-symmetric glass-panel">
                <div className="hero-left">
                    <h1 className="hero-greeting">
                        ¡Hola, <span className="text-gradient">{fullName}</span>! 👋
                    </h1>
                    <p className="hero-subtitle">
                        Panel de Aprendizaje y Práctica en <strong>SaberLab</strong>
                    </p>
                    <div className="hero-quick-actions">
                        {quickActions.map(qa => (
                            qa.to ? (
                                <Link key={qa.label} to={qa.to} className="hero-action-pill">
                                    {qa.icon}
                                    <span>{qa.label}</span>
                                </Link>
                            ) : (
                                <button key={qa.label} type="button" onClick={qa.onClick} className="hero-action-pill" style={{ cursor: 'pointer' }}>
                                    {qa.icon}
                                    <span>{qa.label}</span>
                                </button>
                            )
                        ))}
                    </div>
                </div>

                <div className="hero-right">
                    {/* Tarjeta de Racha Activa */}
                    <div className="hero-kpi-card racha-glow">
                        <Flame size={24} color="#f97316" className="flame-pulse-anim" />
                        <div>
                            <div className="kpi-value" style={{ color: '#fed7aa' }}>{streakDays} días</div>
                            <div className="kpi-label">Racha Activa</div>
                        </div>
                    </div>

                    {/* Tarjeta de Lecciones */}
                    <div className="hero-kpi-card">
                        <BookOpen size={24} color="#38bdf8" />
                        <div>
                            <div className="kpi-value" style={{ color: '#bae6fd' }}>
                                {hasEnrolledCourses ? `${lessonsCompleted} / ${totalLessons}` : '0 / 0'}
                            </div>
                            <div className="kpi-label">Lecciones Listas</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. FILA 1: ACCIÓN PRINCIPAL (IZQ) vs NIVEL STEAM (DER) [100% SIMÉTRICA] ── */}
            <div className="symmetric-grid-row">
                
                {/* IZQUIERDA: Lanzador del Curso Activo o Estado Sin Cursos */}
                {hasEnrolledCourses ? (
                    <div className="glass-panel symmetric-card course-launcher-card" style={{ '--accent-color': courseColor }}>
                        <div className="card-top-bar">
                            <div className="card-title-group">
                                <div className="course-icon-badge" style={{ background: `${courseColor}20`, color: courseColor }}>
                                    {courseIcon}
                                </div>
                                <div>
                                    <span className="course-tag-badge" style={{ background: `${courseColor}20`, color: courseColor }}>
                                        {mainCourseDef.abbr || 'CURSO ACTIVO'}
                                    </span>
                                    <h2 className="card-main-title">{mainCourseDef.name}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="next-mission-box">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <span style={{ fontSize: '0.86rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Sparkles size={15} color={courseColor} />
                                    {courseProgressPercent === 0 ? 'Primer reto:' : 'Siguiente reto:'} <strong style={{ color: courseColor }}>{nextLessonTarget?.title}</strong>
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>
                                    {courseProgressPercent}%
                                </span>
                            </div>
                            <div className="progress-bar-bg" style={{ height: '7px' }}>
                                <div className="progress-bar-fill" style={{ width: `${courseProgressPercent}%`, background: courseColor }} />
                            </div>
                        </div>

                        <Link to={nextLessonLink} className="btn-launch-primary" style={{ background: courseColor }}>
                            <Play size={16} fill="#0f172a" />
                            <span>{courseProgressPercent === 0 ? 'Comenzar Primera Lección' : 'Continuar Lección'}</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="glass-panel symmetric-card course-launcher-card" style={{ '--accent-color': '#38bdf8' }}>
                        <div className="card-top-bar">
                            <div className="card-title-group">
                                <div className="course-icon-badge" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <span className="course-tag-badge" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                                        CURSOS
                                    </span>
                                    <h2 className="card-main-title">Aún no tienes cursos inscritos</h2>
                                </div>
                            </div>
                        </div>

                        <div className="next-mission-box">
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5' }}>
                                Tu docente te asignará a tu clase o puedes unirte con tu código en la sección de Mis Cursos.
                            </p>
                        </div>

                        <Link to="/dashboard/my-courses" className="btn-launch-primary" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
                            <Hash size={16} />
                            <span>Ir a Mis Cursos / Unirse con Código</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {/* DERECHA: Nivel STEAM y Progresión de Rango (Abre Ventanita) */}
                <div className="glass-panel symmetric-card rank-card">
                    <div className="card-top-bar">
                        <div className="card-title-group">
                            <div className="rank-emoji-box" style={{ background: `${rank.color}20`, border: `1.5px solid ${rank.color}` }}>
                                {rank.emoji}
                            </div>
                            <div>
                                <span className="course-tag-badge" style={{ background: `${rank.color}20`, color: rank.color }}>
                                    RANGO OFICIAL
                                </span>
                                <h2 className="card-main-title" style={{ color: rank.color }}>Nivel: {rank.name}</h2>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowRanksModal(true)} 
                            className="header-link-pill btn-ranks-modal-trigger"
                            title="Ver Sistema Completo de Rangos"
                        >
                            Sistema de Rangos ➔
                        </button>
                    </div>

                    <div className="next-mission-box" onClick={() => setShowRanksModal(true)} style={{ cursor: 'pointer' }} title="Haz clic para ver todos los rangos">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.86rem', color: '#cbd5e1' }}>
                                Próximo rango: <strong style={{ color: '#fff' }}>{nextRank?.name || 'Maestro'}</strong>
                            </span>
                            <span style={{ fontSize: '0.8rem', color: rank.color, fontWeight: 800 }}>
                                {rankProgress}%
                            </span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '7px' }}>
                            <div className="progress-bar-fill" style={{ width: `${rankProgress}%`, background: rank.color }} />
                        </div>
                    </div>

                    <div className="rank-footer-desc" onClick={() => setShowRanksModal(true)} style={{ cursor: 'pointer' }}>
                        <span>🏆 {rank.description} ({lessonsCompleted} lecciones aprobadas) • <strong>Ver todos los niveles ℹ️</strong></span>
                    </div>
                </div>

            </div>

            {/* ── 3. FILA 2: ACTIVIDAD DE ESTUDIO (IZQ) vs AGENDA DE EXÁMENES (DER) [100% SIMÉTRICA] ── */}
            <div className="symmetric-grid-row">
                
                {/* IZQUIERDA: Actividad y Constancia */}
                <div className="glass-panel symmetric-card analytics-card">
                    <div className="card-top-bar">
                        <div className="card-title-group">
                            <Activity size={20} color="#38bdf8" />
                            <h2 className="card-main-title">Constancia de Estudio</h2>
                        </div>
                        <span className="goal-status-badge">
                            🎯 Meta: {totalWeeklyHours}h / {weeklyGoalHours}h ({weeklyGoalPercent}%)
                        </span>
                    </div>

                    {/* Gráfico Semanal Claro */}
                    <div className="weekly-bars-grid">
                        {weeklyActivity.map((d, i) => (
                            <div key={i} className="bar-column">
                                <div className="bar-track">
                                    <div 
                                        className={`bar-solid-fill ${d.hours === 0 ? 'empty' : ''} ${d.isToday ? 'today' : ''}`}
                                        style={{ height: d.hours === 0 ? '6px' : `${Math.round((d.hours / maxHours) * 100)}%` }}
                                        title={`${d.day}: ${d.hours}h`}
                                    >
                                        {d.hours > 0 && <span className="bar-tag-hours">{d.hours}h</span>}
                                    </div>
                                </div>
                                <span className={`bar-day-name ${d.isToday ? 'today' : ''}`}>
                                    {d.isToday ? `${d.day} (Hoy)` : d.day}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Desglose Claro de Práctica vs Teoría */}
                    <div className="study-telemetry-row">
                        <div className="telemetry-box">
                            <span className="telemetry-icon">🧪</span>
                            <div>
                                <div className="telemetry-num" style={{ color: '#38bdf8' }}>
                                    {formatMins(practiceMins)} ({practicePercent}%)
                                </div>
                                <div className="telemetry-label">Laboratorios y Simulador</div>
                            </div>
                        </div>
                        <div className="telemetry-box">
                            <span className="telemetry-icon">📖</span>
                            <div>
                                <div className="telemetry-num" style={{ color: '#a855f7' }}>
                                    {formatMins(theoryMins)} ({theoryPercent}%)
                                </div>
                                <div className="telemetry-label">Teoría y Retos Prácticos</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DERECHA: Agenda Oficial de Evaluaciones */}
                <div className="glass-panel symmetric-card schedule-card-v2">
                    <div className="card-top-bar">
                        <div className="card-title-group">
                            <AlarmClock size={20} color="#f43f5e" />
                            <h2 className="card-main-title">Próximas Actividades Oficiales</h2>
                        </div>
                        <Link to="/dashboard/grades" className="header-link-pill">
                            Libreta ➔
                        </Link>
                    </div>

                    <div className="agenda-items-container">
                        {upcomingActivities.length === 0 ? (
                            <div style={{ padding: '1.8rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                                <Clock size={28} color="#64748b" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                                No tienes actividades oficiales programadas.
                            </div>
                        ) : (
                            upcomingActivities.slice(0, 3).map((act) => (
                                <div 
                                    key={act.id} 
                                    className="agenda-item-row"
                                    style={act.isDone ? { borderColor: 'rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.04)' } : (act.isLocked ? { opacity: 0.85 } : {})}
                                >
                                    <div className="agenda-item-left">
                                        <div className="agenda-badge-row">
                                            {act.isDone ? (
                                                <span className="badge-pill done">✓ Rendido</span>
                                            ) : act.isLocked ? (
                                                <span className="badge-pill" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                                                    🔒 Bloqueado
                                                </span>
                                            ) : (
                                                <span className="badge-pill upcoming">📅 {act.type}</span>
                                            )}
                                            <span className="badge-date">{act.date}</span>
                                        </div>
                                        <div className="agenda-item-title">{act.title}</div>
                                    </div>

                                    <div className="agenda-item-right">
                                        <div className={`score-badge ${act.isDone ? 'done' : ''}`}>
                                            <span className="score-num">{act.isDone ? act.pointsEarned : act.points}</span>
                                            <span className="score-txt">pts</span>
                                        </div>
                                        {act.isDone ? (
                                            <Link 
                                                to={`/dashboard/evaluations/${act.evalKey}/play?review=true`} 
                                                className="action-btn-mini review"
                                                title="Ver Revisión del Examen"
                                            >
                                                <Eye size={13} />
                                            </Link>
                                        ) : act.isLocked ? (
                                            <div 
                                                className="action-btn-mini locked"
                                                title="Examen bloqueado por el docente"
                                                style={{
                                                    background: 'rgba(100, 116, 139, 0.12)',
                                                    border: '1px solid rgba(100, 116, 139, 0.25)',
                                                    color: '#64748b',
                                                    cursor: 'not-allowed',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <Lock size={13} />
                                            </div>
                                        ) : (
                                            <Link 
                                                to={`/dashboard/evaluations/${act.evalKey}`} 
                                                className="action-btn-mini present"
                                                title="Presentar Examen"
                                            >
                                                <Play size={13} fill="currentColor" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* ── 4. MODAL / VENTANITA: SISTEMA DE RANGOS STEAM ── */}
            {showRanksModal && (
                <div className="ranks-modal-backdrop animate-fade-in" onClick={() => setShowRanksModal(false)}>
                    <div className="ranks-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Cabecera del Modal */}
                        <div className="ranks-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="ranks-modal-icon-glow">
                                    <Trophy size={22} color="#fbbf24" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>
                                        Sistema de Rangos por lecciones
                                    </h2>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
                                        Asciende de nivel aprobando lecciones y retos en tus cursos.
                                    </p>
                                </div>
                            </div>
                            <button className="ranks-modal-close-btn" onClick={() => setShowRanksModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Lista Vertical Compacta: 6 Rangos Sin Scroll */}
                        <div className="ranks-vertical-list">
                            {ranks.map((r) => {
                                const isUnlocked = lessonsCompleted >= r.minLessons;
                                const isCurrent = rank.name === r.name;

                                return (
                                    <div 
                                        key={r.name} 
                                        className={`rank-vertical-row ${isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'}`}
                                        style={isCurrent ? { 
                                            borderColor: r.color, 
                                            background: `linear-gradient(135deg, ${r.color}22 0%, rgba(15, 23, 42, 0.95) 100%)`,
                                            boxShadow: `0 0 14px ${r.color}35`,
                                            borderWidth: '1.5px'
                                        } : {}}
                                    >
                                        <div className="rank-row-left">
                                            <div 
                                                className="rank-row-emoji" 
                                                style={{ 
                                                    background: `${r.color}25`, 
                                                    border: `1px solid ${r.color}`,
                                                }}
                                            >
                                                {r.emoji}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                    <span className="rank-row-name" style={{ color: isCurrent ? r.color : isUnlocked ? '#fff' : '#64748b' }}>
                                                        {r.name}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="badge-current-pill" style={{ background: r.color }}>
                                                            ✓ Nivel Actual
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="rank-row-desc" style={{ color: isCurrent ? '#cbd5e1' : '#64748b' }}>
                                                    {r.description}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rank-row-right">
                                            <span className="rank-row-req" style={{ color: isCurrent ? r.color : '#94a3b8' }}>
                                                {r.minLessons === 0 ? 'Inicial' : `${r.minLessons} lecc.`}
                                            </span>
                                            {isCurrent ? (
                                                <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.74rem' }}>
                                                    {lessonsCompleted} lecc.
                                                </span>
                                            ) : isUnlocked ? (
                                                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.74rem' }}>✓ Superado</span>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <Lock size={11} /> Bloqueado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default PanelInicio;
