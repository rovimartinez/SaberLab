import React from 'react';
import { Calendar, AlarmClock, BookOpen, Clock, Target, ArrowRight, Play, Zap, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();

    const fullName = user?.user_metadata?.full_name?.split(' ')[0] || 'Estudiante';

    const upcomingActivities = [
        {
            id: 1,
            date: 'Hoy',
            type: 'EVALUACIÓN',
            badgeClass: 'badge-eval',
            title: 'Módulo 1 - Examen 1',
            course: 'Robótica Educativa',
            points: 150
        },
        {
            id: 2,
            date: 'Mañana',
            type: 'TAREA',
            badgeClass: 'badge-task',
            title: 'Practica de Circuitos',
            course: 'Electricidad',
            points: 50
        }
    ];

    const enrolledCourses = [
        {
            id: 5,
            abbr: 'RE',
            slug: 'robotica-educativa',
            name: 'Robótica Educativa',
            icon: <Bot size={24} />,
            color: '#a855f7',
            progress: 85,
            lessons: 16,
            lastLesson: 'Sensor Ultrasonido'
        },
        {
            id: 1,
            abbr: 'EE',
            slug: 'electricidad-y-electronica',
            name: 'Electricidad y Electrónica',
            icon: <Zap size={24} />,
            color: '#f59e0b',
            progress: 45,
            lessons: 12,
            lastLesson: 'Resistencia eléctrica'
        }
    ];

    const lastCourse = enrolledCourses[0];

    return (
        <div className="dashboard-grid">
            {/* Banner de Bienvenida */}
            <div className="welcome-banner glass-panel" style={{ padding: '2rem' }}>
                <div className="banner-content">
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>
                        ¡Hola, <span className="text-gradient" style={{ fontWeight: 800 }}>{fullName}</span>! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                        ¿Qué aprenderemos hoy?
                    </p>
                </div>
                <div className="banner-stats">
                    <div className="stat-item">
                        <Target className="text-gradient" size={24} color="#10b981" />
                        <div>
                            <div className="stat-value">65%</div>
                            <div className="stat-label">Progreso General</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Clock className="text-gradient" size={24} color="#a855f7" />
                        <div>
                            <div className="stat-value">7</div>
                            <div className="stat-label">Días de Racha</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <BookOpen className="text-gradient" size={24} color="#3b82f6" />
                        <div>
                            <div className="stat-value">2</div>
                            <div className="stat-label">Cursos</div>
                        </div>
                    </div>
                </div>
            </div>

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
                            {upcomingActivities.map((activity) => (
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
                        {enrolledCourses.map(course => (
                            <Link
                                to={`/dashboard/my-courses/${course.slug}`}
                                key={course.id}
                                className="subject-card glass-panel"
                                style={{ padding: '1.25rem', textDecoration: 'none' }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        background: `${course.color}20`,
                                        color: course.color,
                                        padding: '10px',
                                        borderRadius: '12px',
                                        flexShrink: 0
                                    }}>
                                        {course.icon}
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
                                                    background: course.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: course.color }}>
                                        {course.progress}%
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
