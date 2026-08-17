import React from 'react';
import { Calendar, AlarmClock, BookOpen, Clock, Target, ArrowRight, Play, Zap, Bot, GraduationCap, Gamepad2, Award, User, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import { getRankByLessons } from '../data/ranksData';
import '../styles/PanelInicio.css';

const getCourseIcon = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr);
    if (def?.icon) return def.icon;
    if (abbr === 'RE') return <Bot size={24} />;
    if (abbr === 'EE') return <Zap size={24} />;
    return <GraduationCap size={24} />;
};

const getCourseColor = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr);
    return def?.color || '#6366f1';
};

// Gráfica de barras de actividad semanal (CSS puro)
function WeeklyActivityChart({ userProgress }) {
    const today = new Date().getDay(); // 0=Dom, 1=Lun,...
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const activity = userProgress?.weekly_hours || [0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(...activity, 1);

    return (
        <div className="activity-chart-card">
            <div className="activity-chart-header">
                <h3 className="activity-chart-title">
                    <Activity size={18} color="#a855f7" />
                    Actividad esta semana
                </h3>
            </div>
            <div className="activity-chart-bars">
                {days.map((day, i) => {
                    const val = activity[i] || 0;
                    const heightPct = `${Math.round((val / maxVal) * 100)}%`;
                    const isToday = i === (today === 0 ? 6 : today - 1);
                    return (
                        <div key={day} className="activity-bar-col" style={{ animationDelay: `${i * 0.06}s` }}>
                            <div className="activity-bar-wrapper">
                                <div
                                    className={`activity-bar ${val === 0 ? 'empty' : ''} ${isToday ? 'today' : ''}`}
                                    style={{ height: val === 0 ? '6px' : heightPct, animationDelay: `${i * 0.08}s` }}
                                />
                            </div>
                            <span className="activity-bar-day">{day}</span>
                            {val > 0 && <span className="activity-bar-val">{val}h</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const PanelInicio = () => {
    const { user, enrolledCourses, userProgress } = useAuth();

    const fullName = user?.user_metadata?.full_name?.split(' ')[0] || 'Estudiante';

    const upcomingActivities = [];

    const lastCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;

    const totalProgress = typeof userProgress?.overall_progress === 'number'
        ? userProgress.overall_progress
        : (enrolledCourses.length > 0
            ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length)
            : 0);

    const lessonsCompleted = userProgress?.lessons_completed || 0;
    const streakDays = userProgress?.streak_days || 0;
    const rank = getRankByLessons(lessonsCompleted);

    const achievements = [
        { emoji: '📚', label: 'Lecciones',  value: lessonsCompleted,       color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
        { emoji: '🔥', label: 'Racha',      value: `${streakDays}d`,       color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
        { emoji: '🎓', label: 'Cursos',     value: enrolledCourses.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
        { emoji: rank.emoji, label: 'Rango', value: rank.name,             color: rank.color, bg: `${rank.color}18` },
    ];

    const quickActions = [
        { label: 'Mi Perfil',    icon: <User size={14} />,     to: '/dashboard/profile' },
        { label: 'Gadgets',      icon: <Gamepad2 size={14} />, to: '/dashboard/gadgets' },
        { label: 'Certificados', icon: <Award size={14} />,    to: '/dashboard/certificate/re' },
    ];

    return (
        <div className="dashboard-grid">
            {/* Banner de Bienvenida */}
            <div className="welcome-banner glass-panel" style={{ padding: '2rem' }}>
                <div className="banner-content">
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>
                        ¡Hola, <span className="text-gradient" style={{ fontWeight: 800 }}>{fullName}</span>! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '0 0 1rem' }}>
                        ¿Qué aprenderemos hoy?
                    </p>
                    {/* Quick actions */}
                    <div className="quick-actions">
                        {quickActions.map(qa => (
                            <Link key={qa.label} to={qa.to} className="quick-action-btn">
                                {qa.icon}
                                {qa.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="banner-stats">
                    <div className="stat-item">
                        <Target className="text-gradient" size={24} color="#10b981" />
                        <div>
                            <div className="stat-value">{totalProgress}%</div>
                            <div className="stat-label">Progreso General</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Clock className="text-gradient" size={24} color="#a855f7" />
                        <div>
                            <div className="stat-value">{streakDays}</div>
                            <div className="stat-label">Días de Racha</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <BookOpen className="text-gradient" size={24} color="#3b82f6" />
                        <div>
                            <div className="stat-value">{enrolledCourses.length}</div>
                            <div className="stat-label">Cursos</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado vacío: Sin cursos */}
            {enrolledCourses.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '1.5rem' }}>
                    <GraduationCap size={64} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>No tienes cursos inscritos</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Únete a un curso usando el código que te proporcionó tu docente.
                    </p>
                    <Link to="/dashboard/my-courses" className="btn btn-primary">
                        Unirse a un Curso
                    </Link>
                </div>
            ) : (
            <>
            {/* Continuar donde quedaste */}
            <div className="glass-panel continue-section" style={{ padding: '1.5rem' }}>
                <div className="continue-header">
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>
                        Continuar aprendiendo
                    </h2>
                    <Link to="/dashboard/progress" style={{
                        color: 'var(--accent-blue)',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        Ver progreso <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="continue-card">
                    <div className="continue-icon" style={{ background: `${lastCourse.color}20`, color: lastCourse.color }}>
                        {lastCourse.icon}
                    </div>
                    <div className="continue-info">
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.2rem' }}>
                            {lastCourse.name}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Última lección: <strong style={{ color: 'white' }}>{lastCourse.lastLesson}</strong>
                        </p>
                        <div className="continue-progress" style={{ marginTop: '1rem' }}>
                            <div className="progress-bar-bg" style={{ height: '6px' }}>
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${lastCourse.progress}%`, background: lastCourse.color }}
                                />
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                {lastCourse.progress}% completado
                            </span>
                        </div>
                    </div>
                    <Link
                        to={`/dashboard/my-courses/${lastCourse.slug}`}
                        className="btn btn-primary continue-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem'
                        }}
                    >
                        <Play size={18} />
                        Continuar
                    </Link>
                </div>
            </div>

            {/* Gráfica de actividad semanal */}
            <WeeklyActivityChart userProgress={userProgress} />

            {/* Tarjetas de logros */}
            <div>
                <div className="section-header" style={{ marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>Mis Logros</h2>
                    <Link to="/dashboard/profile" style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', textDecoration: 'none' }}>
                        Ver perfil
                    </Link>
                </div>
                <div className="achievements-section">
                    {achievements.map(a => (
                        <div key={a.label} className="achievement-card">
                            <div className="achievement-icon" style={{ background: a.bg }}>
                                {a.emoji}
                            </div>
                            <div className="achievement-value" style={{ color: a.color }}>{a.value}</div>
                            <div className="achievement-label">{a.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fila: Próximas actividades + Cursos */}
            <div className="content-columns">
                {/* Próximas actividades */}
                <div className="activities-column">
                    <div className="glass-panel activities-widget" style={{ padding: '1.5rem', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(244,63,94,0.1)', padding: '6px', borderRadius: '8px' }}>
                                <AlarmClock size={20} color="#f43f5e" />
                            </div>
                            <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'white', fontWeight: 600 }}>
                                Próximas actividades
                            </h2>
                        </div>

                        <div>
                            {upcomingActivities.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>
                                    Sin actividades próximas.<br />¡Sigue aprendiendo!
                                </div>
                            ) : upcomingActivities.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activity.date === 'Hoy' ? '#10b981' : 'var(--text-secondary)' }}>
                                                {activity.date}
                                            </span>
                                            <span className={`activity-badge ${activity.badgeClass}`}>
                                                {activity.type}
                                            </span>
                                        </div>
                                        <div className="activity-title">{activity.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {activity.course}
                                        </div>
                                    </div>
                                    <div className="activity-points">
                                        <div className="points-value">{activity.points}</div>
                                        <div className="points-label">pts</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mis Cursos Rápido */}
                <div className="subjects-column">
                    <div className="section-header">
                        <h2>Mis Cursos</h2>
                        <Link to="/dashboard/my-courses" style={{
                            color: 'var(--accent-blue)',
                            fontSize: '0.85rem',
                            textDecoration: 'none'
                        }}>
                            Ver todos
                        </Link>
                    </div>

                    <div className="subjects-grid">
                        {enrolledCourses.map(course => {
                            const icon = getCourseIcon(course.abbr);
                            const color = getCourseColor(course.abbr);
                            return (
                            <Link
                                to={`/dashboard/my-courses/${course.slug}`}
                                key={course.id}
                                className="subject-card glass-panel"
                                style={{ padding: '1.25rem', textDecoration: 'none' }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        background: `${color}20`,
                                        color: color,
                                        padding: '10px',
                                        borderRadius: '12px',
                                        flexShrink: 0
                                    }}>
                                        {icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'white' }}>
                                            {course.name}
                                        </h3>
                                        <div className="progress-bar-bg" style={{ height: '6px' }}>
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${course.progress}%`,
                                                    background: color
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: color }}>
                                        {course.progress}%
                                    </span>
                                </div>
                            </Link>
                        )})}
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

export default PanelInicio;
