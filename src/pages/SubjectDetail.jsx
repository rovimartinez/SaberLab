import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, Lock, Zap, Bot, BookOpen, FlaskConical, Box, Gift, ArrowRight, Trophy } from 'lucide-react';
import { getCourseByIdentifier, getLessonInfo } from '../data/coursesData.jsx';
import { gadgets } from '../data/gadgetsData';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import '../styles/SubjectDetail.css';

const agendaItems = [
    { date: 'Marzo 11, 2026', type: 'EVALUACIÓN', title: 'Módulo 1 - 1', points: 150 },
    { date: 'Abril 22, 2026', type: 'EVALUACIÓN', title: 'Módulo 2 - 2', points: 125 },
    { date: 'Mayo 13, 2026', type: 'EVALUACIÓN', title: 'Módulo 3 - 3', points: 125 },
    { date: 'Mayo 27, 2026', type: 'PROYECTO', title: 'Módulo 4 - FINAL', points: 100 }
];

const SubjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, lessonVisibility } = useAuth();
    const realCourse = getCourseByIdentifier(id) || getCourseByIdentifier('RE');
    const abbr = realCourse.abbr;
    const courseId = realCourse.id;
    const courseVisibility = lessonVisibility[courseId] || {};

    const [completedLessons, setCompletedLessons] = useState({});

    // Cargar progreso de lecciones desde Cloudflare D1
    useEffect(() => {
        const loadProgress = async () => {
            if (!user?.id) return;
            try {
                const { data } = await api('/lesson-progress');
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach(item => {
                        if (item.status === 'completed' || item.progress === 100) {
                            map[item.lesson_id] = true;
                        }
                    });
                    setCompletedLessons(map);
                }
            } catch (err) {
                console.error('Error cargando progreso de lecciones:', err);
            }
        };
        loadProgress();
    }, [user?.id, courseId]);

    // Filtrar recompensas que pertenecen a este curso
    const courseRewards = gadgets.filter(g => g.courseAbbr === abbr || (!g.courseAbbr && abbr === 'EE'));

    // Normalizar ID de lección
    const normalizeLessonId = (lessonId, moduleId) => {
        if (lessonId.includes('-')) return lessonId;
        return `${abbr.toLowerCase()}-${moduleId}-${lessonId}`;
    };
    
    const subject = {
        ...realCourse,
        bg: `${realCourse.color}15`,
        teacher: 'Ronny Martinez'
    };

    const courseModules = realCourse?.modules || [];

    // Calcular progreso dinámico del curso
    const { completedCount, totalLessonsCount, progressPercent } = useMemo(() => {
        const all = courseModules.flatMap(m => (m.lessons || []).map(l => ({
            ...l,
            normalizedId: normalizeLessonId(l.id, m.id)
        })));
        const total = all.length;
        const done = all.filter(l => completedLessons[l.normalizedId] || completedLessons[l.id]).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { completedCount: done, totalLessonsCount: total, progressPercent: pct };
    }, [courseModules, completedLessons, abbr]);

    // Redirigir al slug descriptivo si se entra por la abreviatura
    useEffect(() => {
        if (id && realCourse && id !== realCourse.slug) {
            navigate(`/dashboard/my-courses/${realCourse.slug}`, { replace: true });
        }
    }, [id, realCourse, navigate]);
    
    const [expandedModules, setExpandedModules] = useState(() => {
        const initialState = { m1: true };
        courseModules.forEach(m => {
            if (m.lessons?.some(l => l.status === 'current')) {
                initialState[m.id] = true;
            }
        });
        return initialState;
    });

    return (
        <div className="subject-detail-container animate-fade-in" style={{ padding: '0 1rem' }}>
            {/* ── Hero Banner del Curso ── */}
            <div className="detail-header-classic subject-hero" style={{ 
                background: `linear-gradient(90deg, ${subject.color}50 0%, #161d2b 100%)`, 
                border: `1px solid ${subject.color}40`,
                boxShadow: `0 4px 20px ${subject.color}15`
            }}>
                <div className="subject-hero-content" style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: subject.color, letterSpacing: '0.5px' }}>PANEL DEL CURSO</span>
                    </div>
                    
                    <h1 className="subject-hero-title" style={{ color: 'white', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                        {subject.name}
                    </h1>
                    
                    <div className="subject-hero-meta" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="header-stat-item">
                            <span className="stat-label">Docente: <b style={{ color: subject.color }}>{subject.teacher}</b></span>
                        </div>
                        <div className="header-stat-item subject-progress-block" style={{ flex: 1, maxWidth: '240px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem' }}>
                                <span className="stat-label">Progreso ({completedCount}/{totalLessonsCount})</span>
                                <span className="stat-label" style={{ fontWeight: 800, color: subject.color }}>{progressPercent}%</span>
                            </div>
                            <div className="mini-progress-track" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div className="mini-progress-fill" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? '#10b981' : subject.color, height: '100%', transition: 'width 0.4s ease' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arte decorativo de fondo */}
                <div className="subject-hero-art" style={{ color: subject.color }}>
                    {React.cloneElement(subject.icon, { size: 180 })}
                </div>
            </div>

            {/* ── Contenido Principal y Sidebar Derecha ── */}
            <div className="course-content">
                
                {/* ── Columna Izquierda: Plan de Estudios ── */}
                <div className="syllabus-section">
                    <div className="syllabus-header-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.25rem 0', height: '1.5rem' }}>
                        <div className="syllabus-header-icon" style={{ background: `${subject.color}15`, color: subject.color, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={20} />
                        </div>
                        <h2 className="section-title-premium">Plan de Estudios</h2>
                    </div>
                    <div className="modules-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {courseModules.map((module) => (
                            <div key={module.id} className="module-card-improved glass-panel">
                                <div 
                                    className="module-header-action"
                                    onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                                >
                                    <div className="module-title-group">
                                        <div className="module-number" style={{ background: subject.color }}>{module.id.replace('m', '')}</div>
                                        <h3 className="module-name-text">{module.name}</h3>
                                    </div>
                                    <div className="module-meta-info">
                                        <span>{module.lessons.length} lecciones</span>
                                        <div className={`chevron ${expandedModules[module.id] ? 'open' : ''}`}>▼</div>
                                    </div>
                                </div>
                                {expandedModules[module.id] && (
                                    <div className="lessons-list-premium">
                                        {module.lessons.filter(lesson => {
                                            const normalizedId = normalizeLessonId(lesson.id, module.id);
                                            const visibility = courseVisibility[normalizedId];
                                            return visibility === undefined || visibility === true || visibility === false;
                                        }).map((lesson) => {
                                            const normalizedId = normalizeLessonId(lesson.id, module.id);
                                            const visibility = courseVisibility[normalizedId];
                                            const isHidden = visibility === false;
                                            const isCompleted = completedLessons[normalizedId] || completedLessons[lesson.id];
                                            const lessonInfo = getLessonInfo(lesson.id);
                                            return (
                                            <div key={lesson.id} className="lesson-item-improved">
                                                <div className="lesson-indicator-line" style={isCompleted ? { background: '#10b981' } : {}}></div>
                                                <div className="lesson-icon-circle" style={isCompleted ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' } : {}}>
                                                    {isHidden ? <Lock size={20} /> : isCompleted ? <CheckCircle size={20} color="#10b981" /> : <FileText size={20} />}
                                                </div>
                                                <div className="lesson-main-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <h4 className="lesson-title-text" style={isHidden ? { opacity: 0.5 } : {}}>
                                                            {lessonInfo.title || lesson.id}
                                                        </h4>
                                                        {isCompleted && !isHidden && (
                                                            <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                                                Completada ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="lesson-action-area">
                                                    {isHidden ? (
                                                        <div className="locked-badge"><Lock size={14} /></div>
                                                    ) : (
                                                        <button 
                                                            className="lesson-btn start"
                                                            style={{ background: isCompleted ? '#10b981' : subject.color, color: 'white', border: 'none' }}
                                                            onClick={() => navigate(`/dashboard/my-courses/${subject.slug}/${module.id}/${lesson.id}`)}
                                                            title={isCompleted ? 'Repasar Lección' : 'Comenzar Lección'}
                                                        >
                                                            {isCompleted ? <CheckCircle size={14} /> : <PlayCircle size={14} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Columna Derecha: Agenda + Tarjeta de Recompensas del Curso ── */}
                <div className="course-sidebar-improved">
                    
                    {/* 1. Agenda y Evaluación */}
                    <div className="sidebar-card-premium agenda-container">
                        <div className="sidebar-header-row">
                            <div className="sidebar-header-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                                <CheckCircle size={20} />
                            </div>
                            <h2 className="section-title-premium">Agenda y Evaluación</h2>
                        </div>
                        
                        <div className="agenda-list">
                            {agendaItems.map((item, index) => {
                                const parts = item.title.split(' - ');
                                const modulePart = parts[0];
                                const mainTitle = parts.length > 1 ? parts.slice(1).join(' - ') : item.title;
                                
                                return (
                                    <div key={index} className="agenda-card-classic agenda-card-mobile" style={{ padding: '0.85rem 1.25rem' }}>
                                        <div className="agenda-top-bar agenda-top-bar-mobile" style={{ gap: '1rem', width: '100%', display: 'flex', alignItems: 'center' }}>
                                            <div className="agenda-main-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
                                                <span className="agenda-module-badge" style={{ backgroundColor: `${subject.color}20`, color: subject.color, width: '80px', textAlign: 'center', flexShrink: 0 }}>
                                                    {modulePart}
                                                </span>
                                                <span className="agenda-type-pill" style={{ backgroundColor: 'transparent', color: '#f43f5e', fontSize: '0.82rem', padding: '0', fontWeight: 800, width: '135px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.type} {mainTitle.split(' ').pop()}
                                                </span>
                                                <span className="agenda-points-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, width: '70px', textAlign: 'center', flexShrink: 0 }}>
                                                    {item.points} pts
                                                </span>
                                            </div>
                                            <span className="agenda-date-small agenda-date-mobile" style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.75rem', textAlign: 'right', minWidth: '100px' }}>{item.date}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Opción de Entrada a Recompensas del Curso (Debajo de Agenda y Evaluación) */}
                    {courseRewards.length > 0 && (
                        <div className="sidebar-card-premium" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
                            <div className="sidebar-header-row" style={{ marginBottom: '0.75rem' }}>
                                <div className="sidebar-header-icon" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
                                    <Gift size={20} />
                                </div>
                                <div>
                                    <h2 className="section-title-premium" style={{ margin: 0 }}>Mis Recompensas</h2>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        Instrumentos y simuladores del curso
                                    </span>
                                </div>
                            </div>

                            {/* Banner de Estado de Colección */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
                                border: '1px solid rgba(250, 204, 21, 0.3)',
                                borderRadius: '14px',
                                padding: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'rgba(250, 204, 21, 0.2)',
                                        border: '1.5px solid #facc15',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#facc15'
                                    }}>
                                        <Trophy size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                                            {courseRewards.length} Insignias Ganadas
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                                            ✓ Colección Completa
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de Entrada a la Bóveda de Recompensas */}
                            <button
                                onClick={() => navigate(`/dashboard/my-courses/${subject.slug}/rewards`)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '10px 14px',
                                    background: 'linear-gradient(90deg, #facc15 0%, #eab308 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#0f172a',
                                    fontWeight: 900,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
                                    transition: 'all 0.18s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <span>Ver Mis Recompensas</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SubjectDetail;
