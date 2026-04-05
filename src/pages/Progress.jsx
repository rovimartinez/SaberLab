import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Calendar, BookOpen, Clock, ChevronRight, Flame, Activity, Zap, Bot, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import './Progress.css';

const Progress = () => {
    const { user, enrolledCourses } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userProgress, setUserProgress] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const { data: progressData } = await supabase
                .from('progreso_usuario')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (progressData) {
                setUserProgress(progressData);
            }

            const { data: achievementsData } = await supabase
                .from('logros')
                .select('*')
                .eq('user_id', user.id)
                .order('unlocked_at', { ascending: false });

            if (achievementsData) {
                setAchievements(achievementsData);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    const overallProgress = userProgress?.overall_progress || 0;
    const streakDays = userProgress?.streak_days || 0;
    const totalHours = userProgress?.total_hours || 0;
    const lessonsCompleted = userProgress?.lessons_completed || 0;

    const subjectProgress = enrolledCourses.map(c => {
        const courseDef = COURSES_DEFINITION.find(def => def.id === c.id) || c;
        return {
            name: c.name,
            progress: c.progress || 0,
            color: courseDef.color || '#6366f1',
            lessons: Math.round((c.progress || 0) * (c.lessons || 0) / 100),
            totalLessons: c.lessons || 0,
            icon: courseDef.icon || <GraduationCap size={24} />
        };
    });

    const weeklyActivity = [
        { day: 'Lun', hours: 0, color: '#64748b' },
        { day: 'Mar', hours: 0, color: '#64748b' },
        { day: 'Mié', hours: 0, color: '#64748b' },
        { day: 'Jue', hours: 0, color: '#64748b' },
        { day: 'Vie', hours: 0, color: '#64748b' },
        { day: 'Sáb', hours: 0, color: '#64748b' },
        { day: 'Dom', hours: 0, color: '#64748b' }
    ];

    const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 1);

    const generateHeatmapData = () => {
        const weeks = [];
        const today = new Date();
        for (let w = 7; w >= 0; w--) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (w * 7 + (6 - d)));
                week.push({ date, level: 0 });
            }
            weeks.push(week);
        }
        return weeks;
    };

    const heatmapData = generateHeatmapData();

    const getIcon = (iconStr) => {
        switch(iconStr) {
            case '🎯': return '🎯';
            case '🔥': return '🔥';
            case '📚': return '📚';
            case '💯': return '💯';
            case '🧭': return '🧭';
            case '🌙': return '🌙';
            default: return '🏆';
        }
    };

    return (
        <div className="progress-page">
            <div className="page-header">
                <div className="header-title">
                    <TrendingUp size={28} color="#60a5fa" />
                    <h1>Mi Progreso</h1>
                </div>
                <div className="time-range-selector">
                    <button 
                        className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
                        onClick={() => setTimeRange('week')}
                    >
                        Esta Semana
                    </button>
                    <button 
                        className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
                        onClick={() => setTimeRange('month')}
                    >
                        Este Mes
                    </button>
                    <button 
                        className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
                        onClick={() => setTimeRange('all')}
                    >
                        Todo el Tiempo
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state glass-panel"><p>Cargando...</p></div>
            ) : (
            <>
            <div className="overview-cards">
                <div className="overview-card glass-panel main-progress">
                    <div className="progress-circle-container">
                        <svg className="progress-circle" viewBox="0 0 100 100">
                            <circle className="progress-bg" cx="50" cy="50" r="45" />
                            <circle 
                                className="progress-fill" 
                                cx="50" cy="50" r="45" 
                                style={{ 
                                    strokeDasharray: `${overallProgress * 2.83} 283`,
                                    stroke: 'url(#progressGradient)'
                                }}
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="progress-value">
                            <span className="value">{overallProgress}%</span>
                            <span className="label">Completado</span>
                        </div>
                    </div>
                    <div className="progress-details">
                        <h3>Progreso General</h3>
                        <p>{lessonsCompleted} lecciones completadas</p>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="stat-mini glass-panel">
                        <Flame size={24} color="#f97316" />
                        <div className="stat-info">
                            <span className="stat-value">{streakDays}</span>
                            <span className="stat-label">Días de Racha</span>
                        </div>
                    </div>
                    <div className="stat-mini glass-panel">
                        <Clock size={24} color="#3b82f6" />
                        <div className="stat-info">
                            <span className="stat-value">{totalHours}h</span>
                            <span className="stat-label">Tiempo Total</span>
                        </div>
                    </div>
                    <div className="stat-mini glass-panel">
                        <BookOpen size={24} color="#a855f7" />
                        <div className="stat-info">
                            <span className="stat-value">{lessonsCompleted}</span>
                            <span className="stat-label">Lecciones</span>
                        </div>
                    </div>
                    <div className="stat-mini glass-panel">
                        <Award size={24} color="#10b981" />
                        <div className="stat-info">
                            <span className="stat-value">{achievements.filter(a => a.unlocked).length}</span>
                            <span className="stat-label">Logros</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                <div className="grid-column">
                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <Calendar size={20} />
                            Actividad Semanal
                        </h2>
                        <div className="weekly-chart">
                            {weeklyActivity.map((day, index) => (
                                <div key={index} className="chart-bar-container">
                                    <div className="chart-bar-wrapper">
                                        <div 
                                            className="chart-bar"
                                            style={{ 
                                                height: `${day.hours > 0 ? (day.hours / maxHours) * 100 : 0}%`,
                                                background: day.color
                                            }}
                                        >
                                            {day.hours > 0 && (
                                                <span className="bar-value">{day.hours}h</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="chart-label">{day.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <Activity size={20} />
                            Actividad del Mes
                        </h2>
                        <div className="heatmap-container">
                            <div className="heatmap-grid">
                                {heatmapData.map((week, wi) => (
                                    <div key={wi} className="heatmap-week">
                                        {week.map((day, di) => (
                                            <div 
                                                key={di}
                                                className={`heatmap-day level-${day.level}`}
                                                title={`${day.date.toLocaleDateString()}`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="heatmap-legend">
                                <span>Menos</span>
                                <div className="heatmap-day level-0" />
                                <div className="heatmap-day level-1" />
                                <div className="heatmap-day level-2" />
                                <div className="heatmap-day level-3" />
                                <div className="heatmap-day level-4" />
                                <span>Más</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <BookOpen size={20} />
                            Progreso por Materia
                        </h2>
                        {subjectProgress.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No hay cursos inscritos.</p>
                        ) : (
                        <div className="subjects-progress">
                            {subjectProgress.map((subject, index) => (
                                <div 
                                    key={index} 
                                    className="subject-progress-card"
                                    style={{ borderLeftColor: subject.color }}
                                >
                                    <div className="subject-card-header">
                                        <div className="subject-icon" style={{ background: `${subject.color}20`, color: subject.color }}>
                                            {subject.icon}
                                        </div>
                                        <div className="subject-info">
                                            <span className="subject-name">{subject.name}</span>
                                            <span className="subject-lessons">
                                                {subject.lessons} de {subject.totalLessons} lecciones
                                            </span>
                                        </div>
                                        <span className="subject-percentage" style={{ color: subject.color }}>
                                            {subject.progress}%
                                        </span>
                                    </div>
                                    <div className="subject-bar-bg">
                                        <div 
                                            className="subject-bar-fill"
                                            style={{ 
                                                width: `${subject.progress}%`,
                                                background: subject.color,
                                                boxShadow: `0 0 10px ${subject.color}60`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>

                <div className="grid-column">
                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <Award size={20} />
                            Logros Desbloqueados
                        </h2>
                        {achievements.length === 0 ? (
                             <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No hay logros desbloqueados aún.</p>
                        ) : (
                        <div className="achievements-grid">
                            {achievements.map((achievement, index) => (
                                <div 
                                    key={index} 
                                    className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                                >
                                    <div className="achievement-icon">{getIcon(achievement.icon)}</div>
                                    <div className="achievement-info">
                                        <span className="achievement-name">{achievement.name}</span>
                                        <span className="achievement-desc">{achievement.description}</span>
                                        {achievement.unlocked && achievement.unlocked_at && (
                                            <span className="achievement-date">
                                                {new Date(achievement.unlocked_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>

                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <Target size={20} />
                            Historial de Calificaciones
                        </h2>
                        <div className="grades-history">
                            <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>Sin calificaciones aún.</p>
                        </div>
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

export default Progress;
