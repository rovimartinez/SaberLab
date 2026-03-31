import React, { useState } from 'react';
import { TrendingUp, Target, Award, Calendar, BookOpen, Clock, ChevronRight, Flame, Activity, Zap, Bot } from 'lucide-react';
import './Progress.css';

const Progress = () => {
    const [timeRange, setTimeRange] = useState('week');

    const overallProgress = 67;
    const streakDays = 7;
    const totalHours = 48;
    const lessonsCompleted = 24;
    const totalLessons = 36;

    const subjectProgress = [
        { name: 'Electricidad y Electrónica Básica', progress: 45, color: '#f59e0b', lessons: 8, totalLessons: 18, icon: <Zap size={24} /> },
        { name: 'Robótica Educativa', progress: 12, color: '#a855f7', lessons: 3, totalLessons: 25, icon: <Bot size={24} /> }
    ];

    const weeklyActivity = [
        { day: 'Lun', hours: 2.5, color: '#3b82f6' },
        { day: 'Mar', hours: 1.5, color: '#8b5cf6' },
        { day: 'Mié', hours: 3.0, color: '#3b82f6' },
        { day: 'Jue', hours: 2.0, color: '#a855f7' },
        { day: 'Vie', hours: 1.0, color: '#8b5cf6' },
        { day: 'Sáb', hours: 0, color: '#64748b' },
        { day: 'Dom', hours: 0, color: '#64748b' }
    ];

    const maxHours = Math.max(...weeklyActivity.map(d => d.hours));

    const generateHeatmapData = () => {
        const weeks = [];
        const today = new Date();
        
        const fixedData = [
             [0, 1, 2, 1, 3, 0, 0],
             [2, 3, 1, 2, 0, 1, 0],
             [1, 0, 2, 3, 2, 0, 0],
             [0, 1, 1, 2, 3, 1, 0],
             [2, 2, 1, 0, 1, 2, 0],
             [1, 3, 2, 1, 0, 0, 0],
             [0, 1, 2, 2, 1, 0, 0],
             [1, 2, 0, 1, 2, 1, 0]
        ];

        for (let w = 7; w >= 0; w--) {
            const week = [];
            const dataRow = fixedData[7 - w] || [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (w * 7 + (6 - d)));
                const level = dataRow[d] || 0;
                week.push({ date, level });
            }
            weeks.push(week);
        }
        return weeks;
    };

    const heatmapData = generateHeatmapData();

    const achievements = [
        { name: 'Primer Paso', description: 'Completa tu primera lección', icon: '🎯', unlocked: true, date: 'Feb 15, 2026' },
        { name: 'Estudiante Dedicado', description: '7 días de racha consecutivos', icon: '🔥', unlocked: true, date: 'Mar 10, 2026' },
        { name: 'Lectura Rápida', description: 'Completa 5 lecturas', icon: '📚', unlocked: true, date: 'Mar 8, 2026' },
        { name: 'Maestro del Examen', description: 'Obtén 100% en un examen', icon: '💯', unlocked: false, date: null },
        { name: 'Explorador', description: 'Explora 10 cursos diferentes', icon: '🧭', unlocked: false, date: null },
        { name: 'Noctámbulo', description: 'Estudia después de las 10pm', icon: '🌙', unlocked: false, date: null }
    ];

    const gradesHistory = [
        { date: 'Mar 11', exam: 'Módulo 1 - Examen 1', grade: 85, subject: 'Electrónica' },
        { date: 'Mar 5', exam: 'Cuestionario de Circuitos', grade: 92, subject: 'Electrónica' },
        { date: 'Mar 20', exam: 'Cuestionario de Motores', grade: 78, subject: 'Robótica' }
    ];

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
                        <p>{lessonsCompleted} de {totalLessons} lecciones completadas</p>
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
                    </div>
                </div>

                <div className="grid-column">
                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <Award size={20} />
                            Logros Desbloqueados
                        </h2>
                        <div className="achievements-grid">
                            {achievements.map((achievement, index) => (
                                <div 
                                    key={index} 
                                    className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                                >
                                    <div className="achievement-icon">{achievement.icon}</div>
                                    <div className="achievement-info">
                                        <span className="achievement-name">{achievement.name}</span>
                                        <span className="achievement-desc">{achievement.description}</span>
                                        {achievement.unlocked && achievement.date && (
                                            <span className="achievement-date">{achievement.date}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel section-card">
                        <h2 className="section-title">
                            <Target size={20} />
                            Historial de Calificaciones
                        </h2>
                        <div className="grades-history">
                            {gradesHistory.map((grade, index) => (
                                <div key={index} className="grade-item">
                                    <div className="grade-date">{grade.date}</div>
                                    <div className="grade-info">
                                        <span className="grade-exam">{grade.exam}</span>
                                        <span className="grade-subject">{grade.subject}</span>
                                    </div>
                                    <div className="grade-value" style={{ color: grade.grade >= 80 ? '#10b981' : grade.grade >= 60 ? '#f59e0b' : '#f43f5e' }}>
                                        {grade.grade}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
