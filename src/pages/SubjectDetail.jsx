import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, Lock, Zap, Bot, BookOpen, FlaskConical, Box, Gift, ArrowRight, Trophy, Eye, Play, Sparkles } from 'lucide-react';
import { getCourseByIdentifier, getLessonInfo } from '../data/coursesData.jsx';
import { gadgets } from '../data/gadgetsData';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import '../styles/SubjectDetail.css';

const SubjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, lessonVisibility } = useAuth();
    const realCourse = getCourseByIdentifier(id) || getCourseByIdentifier('RE');
    const abbr = realCourse.abbr;
    const courseId = realCourse.id;
    const courseVisibility = lessonVisibility[courseId] || {};

    const [completedLessons, setCompletedLessons] = useState({});

    // Cargar progreso de lecciones e intentos de exámenes desde Cloudflare D1 + LocalStorage
    useEffect(() => {
        const loadProgress = async () => {
            if (!user?.id) return;
            try {
                const [progRes, attRes] = await Promise.allSettled([
                    api('/lesson-progress'),
                    api('/attempts')
                ]);
                const map = {};
                if (progRes.status === 'fulfilled' && Array.isArray(progRes.value?.data)) {
                    progRes.value.data.forEach(item => {
                        if (item.status === 'completed' || item.progress === 100) {
                            map[item.lesson_id] = true;
                        }
                    });
                }
                if (attRes.status === 'fulfilled' && Array.isArray(attRes.value?.data)) {
                    attRes.value.data.forEach(att => {
                        if (att.completed_at && att.evaluation_key) {
                            map[att.evaluation_key] = true;
                            map[att.evaluation_key.toLowerCase()] = true;
                        }
                    });
                }
                // Fallback por si el examen se rindió en la sesión local
                ['ee-m1-l6', 'ee-m2-l10', 'ee-m3-l14', 'ee-m4-l16'].forEach(key => {
                    if (localStorage.getItem(`exam_completed_${key}`)) {
                        map[key] = true;
                    }
                });
                setCompletedLessons(map);
            } catch (err) {
                console.error('Error cargando progreso de lecciones y exámenes:', err);
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
        teacher: realCourse.teacher || 'Ronny Martinez Reyes'
    };

    const courseModules = realCourse?.modules || [];

    const agendaItems = useMemo(() => {
        if (courseModules.some(m => m.evaluation)) {
            return courseModules.filter(m => m.evaluation).map(m => ({
                date: m.evaluation.date,
                type: m.id === 'm4' ? 'PROYECTO' : 'EVALUACIÓN',
                title: `${m.name.split(':')[0]} - ${m.evaluation.title.split(' - ')[0]}`,
                points: m.evaluation.points
            }));
        }
        return [
            { date: '2 de septiembre de 2026', type: 'EVALUACIÓN', title: 'Módulo 1 - Examen 1', points: 150 },
            { date: '28 de septiembre de 2026', type: 'EVALUACIÓN', title: 'Módulo 2 - Examen 2', points: 125 },
            { date: '21 de octubre de 2026', type: 'EVALUACIÓN', title: 'Módulo 3 - Examen 3', points: 125 },
            { date: '11 de noviembre de 2026', type: 'PROYECTO', title: 'Módulo 4 - FINAL', points: 100 }
        ];
    }, [courseModules]);

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
                                        {(() => {
                                            const modLessons = module.lessons || [];
                                            const doneCount = modLessons.filter(l => {
                                                const norm = normalizeLessonId(l.id, module.id);
                                                return completedLessons[norm] || completedLessons[l.id] || localStorage.getItem(`exam_completed_${l.id}`);
                                            }).length;
                                            const isAllDone = modLessons.length > 0 && doneCount === modLessons.length;

                                            if (isAllDone) {
                                                return (
                                                    <span style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                                        ✓ 100% Completado
                                                    </span>
                                                );
                                            }
                                            return (
                                                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                                                    {doneCount}/{modLessons.length} lecciones
                                                </span>
                                            );
                                        })()}
                                        <div className={`chevron ${expandedModules[module.id] ? 'open' : ''}`}>▼</div>
                                    </div>
                                </div>
                                {expandedModules[module.id] && (
                                    <div className="lessons-list-premium">
                                        {module.lessons.filter(lesson => {
                                            const normalizedId = normalizeLessonId(lesson.id, module.id);
                                            const visibility = courseVisibility[normalizedId];
                                            return visibility === undefined || visibility === true || visibility === false;
                                        }).map((lesson, lIdx) => {
                                            const normalizedId = normalizeLessonId(lesson.id, module.id);
                                            const visibility = courseVisibility[normalizedId];
                                            const isHidden = visibility === false;
                                            const isExam = lesson.id === 'ee-m1-l6' || lesson.id.endsWith('-l6') || lesson.id.endsWith('-l10') || lesson.id.endsWith('-l14') || lesson.id.endsWith('-l16');
                                            const isCompleted = !!(completedLessons[normalizedId] || completedLessons[lesson.id] || (isExam && localStorage.getItem(`exam_completed_${lesson.id}`)));
                                            const lessonInfo = getLessonInfo(lesson.id);
                                            const lessonIndexStr = String(lIdx + 1).padStart(2, '0');

                                            return (
                                            <div key={lesson.id} className="lesson-item-improved">
                                                <div className="lesson-indicator-line" style={isCompleted ? { background: '#10b981' } : {}}></div>
                                                <div className="lesson-icon-circle" style={isCompleted ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', fontWeight: 800, fontSize: '0.8rem' } : {}}>
                                                    {isHidden ? <Lock size={16} /> : isCompleted ? <CheckCircle size={18} color="#10b981" /> : <span>{lessonIndexStr}</span>}
                                                </div>
                                                <div className="lesson-main-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <h4 className="lesson-title-text" style={isHidden ? { opacity: 0.5 } : {}}>
                                                            {lessonInfo.title || lesson.id}
                                                        </h4>
                                                        {isCompleted && !isHidden && (
                                                            <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                                                {isExam ? 'Aprobado ✓' : 'Completada ✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="lesson-action-area">
                                                    {isHidden ? (
                                                        <div className="locked-badge"><Lock size={14} /></div>
                                                    ) : (
                                                        <button 
                                                             className="lesson-btn-action"
                                                             style={{ 
                                                                 background: isCompleted 
                                                                     ? 'rgba(16, 185, 129, 0.12)' 
                                                                     : isExam 
                                                                         ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                                                         : subject.color, 
                                                                 color: isCompleted ? '#10b981' : '#0f172a', 
                                                                 border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                                                                 display: 'inline-flex',
                                                                 alignItems: 'center',
                                                                 gap: '5px',
                                                                 padding: '0.38rem 0.85rem',
                                                                 borderRadius: '8px',
                                                                 fontSize: '0.78rem',
                                                                 fontWeight: 800,
                                                                 cursor: 'pointer',
                                                                 transition: 'all 0.2s ease'
                                                             }}
                                                             onClick={() => {
                                                                 if (isExam) {
                                                                     if (isCompleted) {
                                                                         navigate(`/dashboard/evaluations/${normalizedId}/play?review=true`);
                                                                     } else {
                                                                         navigate(`/dashboard/evaluations/${normalizedId}`);
                                                                     }
                                                                 } else {
                                                                     navigate(`/dashboard/my-courses/${subject.slug}/${module.id}/${lesson.id}`);
                                                                 }
                                                             }}
                                                             title={isCompleted 
                                                                 ? (isExam ? 'Ver Revisión del Examen' : 'Repasar Lección') 
                                                                 : (isExam ? 'Ir al Examen Oficial' : 'Comenzar Lección')}
                                                           >
                                                             {isCompleted ? (
                                                                <>
                                                                    <Eye size={13} />
                                                                    <span>{isExam ? 'Revisar' : 'Repasar'}</span>
                                                                </>
                                                             ) : (
                                                                <>
                                                                    <Play size={13} fill="currentColor" />
                                                                    <span>Iniciar</span>
                                                                </>
                                                             )}
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
                                const evalKeyMap = { 0: 'ee-m1-l6', 1: 'ee-m2-l10', 2: 'ee-m3-l14', 3: 'ee-m4-l16' };
                                const targetKey = evalKeyMap[index] || 'ee-m1-l6';
                                const isDone = !!(completedLessons[targetKey] || localStorage.getItem(`exam_completed_${targetKey}`));
                                
                                const formatAgendaDate = (fullDate) => {
                                    if (!fullDate) return '';
                                    return fullDate
                                        .replace(' de septiembre de ', ' Sep ')
                                        .replace(' de octubre de ', ' Oct ')
                                        .replace(' de noviembre de ', ' Nov ')
                                        .replace(' de diciembre de ', ' Dic ')
                                        .replace(' de enero de ', ' Ene ')
                                        .replace(' de febrero de ', ' Feb ')
                                        .replace(' de marzo de ', ' Mar ')
                                        .replace(' de abril de ', ' Abr ')
                                        .replace(' de mayo de ', ' May ')
                                        .replace(' de junio de ', ' Jun ')
                                        .replace(' de julio de ', ' Jul ')
                                        .replace(' de agosto de ', ' Ago ');
                                };

                                return (
                                    <div 
                                        key={index} 
                                        className="agenda-card-classic" 
                                        style={{ 
                                            padding: '0.75rem 0.9rem', 
                                            cursor: 'pointer', 
                                            transition: 'all 0.2s ease',
                                            borderColor: isDone ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.07)',
                                            background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)'
                                        }}
                                        onClick={() => {
                                            if (isDone) {
                                                navigate(`/dashboard/evaluations/${targetKey}/play?review=true`);
                                            } else {
                                                navigate(`/dashboard/evaluations/${targetKey}`);
                                            }
                                        }}
                                        title={`Presentar ${item.title}`}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.75rem' }}>
                                            
                                            {/* Lado Izquierdo: Módulo + Tipo de Evaluación */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                                                <span style={{ 
                                                    backgroundColor: `${subject.color}20`, 
                                                    color: subject.color, 
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 800,
                                                    minWidth: '66px',
                                                    textAlign: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {modulePart}
                                                </span>
                                                <span style={{ 
                                                    color: isDone ? '#10b981' : '#f43f5e', 
                                                    fontSize: '0.82rem', 
                                                    fontWeight: 800,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {item.type} {mainTitle.split(' ').pop()}
                                                </span>
                                            </div>

                                            {/* Lado Derecho: Puntos + Fecha (Rodados a la Derecha) */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                                                <span style={{ 
                                                    background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.12)', 
                                                    color: isDone ? '#10b981' : '#fbbf24', 
                                                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(251, 191, 36, 0.25)',
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.72rem', 
                                                    fontWeight: 800,
                                                    minWidth: '58px',
                                                    textAlign: 'center',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {item.points} pts
                                                </span>
                                                <span style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: '#94a3b8', 
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    minWidth: '76px',
                                                    textAlign: 'right'
                                                }}>
                                                    {formatAgendaDate(item.date)}
                                                </span>
                                            </div>

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
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                    color: '#0f172a',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Sparkles size={16} fill="#0f172a" />
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
