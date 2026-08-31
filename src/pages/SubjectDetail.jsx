import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, Lock, Zap, Bot, BookOpen, FlaskConical, Box, Gift, ArrowRight, Trophy, Eye, Play, Sparkles, Award } from 'lucide-react';
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

    // Calcular progreso dinámico del curso (lecciones + exámenes de cada módulo)
    const { completedCount, totalLessonsCount, progressPercent } = useMemo(() => {
        const isExamLesson = (lessonId) => lessonId === 'ee-m1-l6' || lessonId === 'ee-m2-l10' || lessonId === 'ee-m3-l14' || lessonId === 'ee-m4-l16' || lessonId.endsWith('-eval');
        const regularLessons = courseModules.flatMap(m => (m.lessons || []).filter(l => !isExamLesson(l.id)).map(l => ({
            ...l,
            normalizedId: normalizeLessonId(l.id, m.id)
        })));
        const evaluations = courseModules.filter(m => m.evaluation).map(m => {
            const evalId = m.evaluation.id || `${abbr.toLowerCase()}-${m.id}-eval`;
            return {
                id: evalId,
                normalizedId: evalId
            };
        });

        const allItems = [...regularLessons, ...evaluations];
        const total = allItems.length;
        const done = allItems.filter(item => completedLessons[item.normalizedId] || completedLessons[item.id] || localStorage.getItem(`exam_completed_${item.id}`)).length;
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
                '--subject-color': subject.color,
                borderColor: `${subject.color}50`
            }}>
                <div className="subject-hero-content" style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: subject.color, letterSpacing: '0.5px' }}>PANEL DEL CURSO</span>
                    </div>
                    
                    <h1 className="subject-hero-title">
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
                                            const isExamLesson = (lessonId) => lessonId === 'ee-m1-l6' || lessonId === 'ee-m2-l10' || lessonId === 'ee-m3-l14' || lessonId === 'ee-m4-l16' || lessonId.endsWith('-eval');
                                            const regularLessons = (module.lessons || []).filter(l => !isExamLesson(l.id));
                                            const hasExam = !!module.evaluation;
                                            const evalId = module.evaluation ? (module.evaluation.id || `${abbr.toLowerCase()}-${module.id}-eval`) : null;
                                            const isExamDone = hasExam && !!(completedLessons[evalId] || localStorage.getItem(`exam_completed_${evalId}`));
                                            const doneCount = regularLessons.filter(l => {
                                                const norm = normalizeLessonId(l.id, module.id);
                                                return completedLessons[norm] || completedLessons[l.id];
                                            }).length + (isExamDone ? 1 : 0);
                                            const totalCount = regularLessons.length + (hasExam ? 1 : 0);
                                            const isAllDone = totalCount > 0 && doneCount === totalCount;

                                            if (isAllDone) {
                                                return (
                                                    <span style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                                        ✓ 100% Completado
                                                    </span>
                                                );
                                            }
                                            return (
                                                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                                                    {doneCount}/{totalCount} lecciones y examen
                                                </span>
                                            );
                                        })()}
                                        <div className={`chevron ${expandedModules[module.id] ? 'open' : ''}`}>▼</div>
                                    </div>
                                </div>
                                {expandedModules[module.id] && (
                                    <div className="lessons-list-premium">
                                        {(() => {
                                            const isExamLesson = (lessonId) => lessonId === 'ee-m1-l6' || lessonId === 'ee-m2-l10' || lessonId === 'ee-m3-l14' || lessonId === 'ee-m4-l16' || lessonId.endsWith('-eval');
                                            const regularLessons = (module.lessons || []).filter(l => !isExamLesson(l.id));
                                            const hasExam = !!module.evaluation;
                                            const evalId = module.evaluation ? (module.evaluation.id || `${abbr.toLowerCase()}-${module.id}-eval`) : null;
                                            const isExamHidden = hasExam ? (courseVisibility[evalId] === false) : false;
                                            const isExamCompleted = hasExam && !!(completedLessons[evalId] || localStorage.getItem(`exam_completed_${evalId}`));

                                            return (
                                                <>
                                                    {regularLessons.filter(lesson => {
                                                        const normalizedId = normalizeLessonId(lesson.id, module.id);
                                                        const visibility = courseVisibility[normalizedId];
                                                        return visibility === undefined || visibility === true || visibility === false;
                                                    }).map((lesson, lIdx) => {
                                                        const normalizedId = normalizeLessonId(lesson.id, module.id);
                                                        const visibility = courseVisibility[normalizedId];
                                                        const isHidden = visibility === false;
                                                        const isCompleted = !!(completedLessons[normalizedId] || completedLessons[lesson.id]);
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
                                                                </div>
                                                            </div>
                                                            <div className="lesson-action-area">
                                                                {isHidden ? (
                                                                    <div className="locked-badge">
                                                                        <Lock size={14} />
                                                                        <span>Bloqueada</span>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        className="lesson-btn-action"
                                                                        style={{ 
                                                                            background: isCompleted 
                                                                                ? 'rgba(16, 185, 129, 0.12)' 
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
                                                                            navigate(`/dashboard/my-courses/${subject.slug}/${module.id}/${lesson.id}`);
                                                                        }}
                                                                        title={isCompleted ? 'Repasar Lección' : 'Comenzar Lección'}
                                                                    >
                                                                        {isCompleted ? (
                                                                            <>
                                                                                <Eye size={13} />
                                                                                <span>Repasar</span>
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

                                                    {/* Examen / Evaluación Oficial al final del Módulo */}
                                                    {hasExam && (
                                                        <div 
                                                            key={evalId} 
                                                            className="lesson-item-improved" 
                                                            style={{
                                                                background: isExamHidden 
                                                                    ? 'var(--bg-secondary)' 
                                                                    : isExamCompleted 
                                                                        ? 'rgba(16, 185, 129, 0.06)' 
                                                                        : 'rgba(245, 158, 11, 0.08)',
                                                                border: isExamHidden 
                                                                    ? '1px dashed var(--glass-border)' 
                                                                    : isExamCompleted 
                                                                        ? '1px solid rgba(16, 185, 129, 0.35)' 
                                                                        : '1px solid rgba(245, 158, 11, 0.38)',
                                                                marginTop: '0.65rem'
                                                            }}
                                                        >
                                                            <div className="lesson-indicator-line" style={isExamCompleted ? { background: '#10b981' } : isExamHidden ? { background: '#64748b' } : { background: '#f59e0b' }}></div>
                                                            <div className="lesson-icon-circle" style={{
                                                                background: isExamCompleted ? 'rgba(16, 185, 129, 0.15)' : isExamHidden ? 'var(--glass-bg)' : 'rgba(245, 158, 11, 0.15)',
                                                                color: isExamCompleted ? '#10b981' : isExamHidden ? 'var(--text-secondary)' : '#fbbf24',
                                                                borderColor: isExamCompleted ? 'rgba(16, 185, 129, 0.3)' : isExamHidden ? 'var(--glass-border)' : 'rgba(245, 158, 11, 0.35)'
                                                            }}>
                                                                {isExamHidden ? <Lock size={16} /> : isExamCompleted ? <CheckCircle size={18} color="#10b981" /> : <Award size={18} color="#fbbf24" />}
                                                            </div>
                                                            <div className="lesson-main-info">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                    <span style={{
                                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                                        color: '#fff',
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 900,
                                                                        padding: '2px 7px',
                                                                        borderRadius: '5px',
                                                                        letterSpacing: '0.5px'
                                                                    }}>
                                                                        EXAMEN
                                                                    </span>
                                                                    <h4 className="lesson-title-text" style={isExamHidden ? { opacity: 0.5 } : {}}>
                                                                        {module.evaluation.title}
                                                                    </h4>
                                                                    <span style={{
                                                                        fontSize: '0.72rem',
                                                                        background: isExamCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                                                                        color: isExamCompleted ? '#34d399' : '#fbbf24',
                                                                        border: isExamCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(251, 191, 36, 0.25)',
                                                                        padding: '1px 6px',
                                                                        borderRadius: '4px',
                                                                        fontWeight: 800
                                                                    }}>
                                                                        {module.evaluation.points} pts
                                                                    </span>
                                                                    {isExamCompleted && !isExamHidden && (
                                                                        <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                                                            Aprobado ✓
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="lesson-duration-text" style={{ color: 'var(--text-secondary)' }}>
                                                                    {module.evaluation.date ? `Fecha: ${module.evaluation.date}` : 'Evaluación del módulo'}
                                                                </span>
                                                            </div>
                                                            <div className="lesson-action-area">
                                                                {isExamHidden ? (
                                                                    <div className="locked-badge">
                                                                        <Lock size={14} />
                                                                        <span>Bloqueado</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        className="lesson-btn-action"
                                                                        style={{
                                                                            background: isExamCompleted ? 'rgba(16, 185, 129, 0.15)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                            color: isExamCompleted ? '#10b981' : '#0f172a',
                                                                            border: isExamCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '5px',
                                                                            padding: '0.38rem 0.85rem',
                                                                            borderRadius: '8px',
                                                                            fontSize: '0.78rem',
                                                                            fontWeight: 800,
                                                                            cursor: 'pointer',
                                                                            boxShadow: isExamCompleted ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.25)'
                                                                        }}
                                                                        onClick={() => {
                                                                            if (isExamCompleted) {
                                                                                navigate(`/dashboard/evaluations/${evalId}/play?review=true`);
                                                                            } else {
                                                                                navigate(`/dashboard/evaluations/${evalId}`);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isExamCompleted ? (
                                                                            <>
                                                                                <Eye size={13} />
                                                                                <span>Revisar</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Play size={13} fill="currentColor" />
                                                                                <span>Presentar</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                             );
                                         })()}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* ── Columna Derecha: Mis Recompensas + Información del Curso ── */}
                 <div className="course-sidebar-improved">
                     {/* Opción de Entrada a Recompensas del Curso */}
                     {courseRewards.length > 0 && (
                         <div className="sidebar-card-premium glass-panel" style={{ marginTop: 0, padding: '1.25rem' }}>
                             <div className="sidebar-header-row" style={{ marginBottom: '0.75rem' }}>
                                 <div className="sidebar-header-icon" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
                                     <Gift size={20} />
                                 </div>
                                 <div>
                                     <h2 className="section-title-premium" style={{ margin: 0 }}>Mis Recompensas</h2>
                                     <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                         Instrumentos y simuladores del curso
                                     </span>
                                 </div>
                             </div>

                             {/* Banner de Estado de Colección */}
                             <div className="rewards-collection-banner">
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
                                         color: '#facc15',
                                         flexShrink: 0
                                     }}>
                                         <Trophy size={20} />
                                     </div>
                                     <div>
                                         <div className="rewards-collection-title">
                                             {courseRewards.length} Insignias Ganadas
                                         </div>
                                         <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
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

                     {/* Tarjeta de Información y Metodología */}
                     <div className="sidebar-card-premium glass-panel" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
                         <div className="sidebar-header-row" style={{ marginBottom: '0.75rem' }}>
                             <div className="sidebar-header-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                                 <BookOpen size={20} />
                             </div>
                             <div>
                                 <h2 className="section-title-premium" style={{ margin: 0 }}>Información del Curso</h2>
                                 <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                     Detalles y metodología activa
                                 </span>
                             </div>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                             <div className="course-info-row">
                                 <span className="info-row-label">Docente:</span>
                                 <span className="info-row-val">{subject.teacher}</span>
                             </div>
                             <div className="course-info-row">
                                 <span className="info-row-label">Modalidad:</span>
                                 <span className="info-row-val highlight-blue">ABP STEAM + Simuladores</span>
                             </div>
                             <div className="course-info-row">
                                 <span className="info-row-label">Evaluaciones:</span>
                                 <span className="info-row-val highlight-gold">Al final de cada módulo</span>
                             </div>
                         </div>
                     </div>

                </div>
            </div>
        </div>
    );
};

export default SubjectDetail;
