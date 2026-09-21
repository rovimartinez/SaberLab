import React, { useState } from 'react';
import { BookOpen, Target, User, ArrowRight, Check, Lock, Eye, EyeOff, Play, ExternalLink, GraduationCap, Award } from 'lucide-react';
import { COURSES_DEFINITION, getLessonInfo, getCourseColor } from '../../../data/coursesData.jsx';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import LessonModalViewer from '../../lesson/modals/LessonModalViewer';

export const CoursesModalContent = ({
    availableCourses = [],
    selectedCourseId,
    setSelectedCourseId,
    selectedModalCourse,
    setSelectedModalCourse,
    mainCourseDef,
    lessonsCompleted,
    completedLessonsMap = {},
    lessonVisibility = {},
    expandedModules = {},
    toggleModuleExpand,
    isStaff = false,
    onClose
}) => {
    const { refreshLessonVisibility } = useAuth() || {};
    const [localVisibility, setLocalVisibility] = useState({});
    const [activeLessonModal, setActiveLessonModal] = useState(null);

    const isExamLesson = (id) => {
        const lower = (id || '').toLowerCase();
        return lower.endsWith('-l6') || lower.endsWith('-l6e') || lower.endsWith('-l10') || lower.endsWith('-l14') || lower.endsWith('-l16') || lower.includes('eval') || lower.includes('examen');
    };

    // ── VISTA EXCLUSIVA: PLAN DE ESTUDIOS DEL CURSO ACTIVO ──
    const modalCourse = selectedModalCourse || mainCourseDef || COURSES_DEFINITION[0];
    const cColor = modalCourse.color || getCourseColor(modalCourse.id) || '#f59e0b';
    const cModules = modalCourse.modules || [];
    const cIdKey = modalCourse.id || modalCourse.slug;
    const cVis = (lessonVisibility && (lessonVisibility[cIdKey] || lessonVisibility[String(cIdKey)] || lessonVisibility[modalCourse.abbr])) || {};

    const getNormalizedLessonId = (moduleId, lessonId) => {
        if (lessonId.includes('-')) return lessonId;
        const abbr = modalCourse?.abbr?.toLowerCase() || 're';
        return `${abbr}-${moduleId}-${lessonId}`;
    };

    const isLessonItemVisible = (moduleId, lessonId) => {
        const normId = getNormalizedLessonId(moduleId, lessonId);
        if (localVisibility.hasOwnProperty(normId)) return localVisibility[normId] !== false && localVisibility[normId] !== 'hidden';
        if (lessonVisibility.hasOwnProperty(normId)) return lessonVisibility[normId] !== false && lessonVisibility[normId] !== 'hidden';
        if (cVis.hasOwnProperty(lessonId)) return cVis[lessonId] !== false && cVis[lessonId] !== 'hidden';
        if (cVis.hasOwnProperty(lessonId.toLowerCase())) return cVis[lessonId.toLowerCase()] !== false && cVis[lessonId.toLowerCase()] !== 'hidden';
        return true;
    };

    // Returns 'visible' | 'locked' | 'hidden'
    const getLessonState = (moduleId, lessonId) => {
        const normId = getNormalizedLessonId(moduleId, lessonId);
        const raw =
            localVisibility.hasOwnProperty(normId) ? localVisibility[normId] :
            lessonVisibility.hasOwnProperty(normId) ? lessonVisibility[normId] :
            cVis.hasOwnProperty(lessonId) ? cVis[lessonId] :
            cVis.hasOwnProperty(lessonId.toLowerCase()) ? cVis[lessonId.toLowerCase()] :
            true;
        if (raw === 'hidden') return 'hidden';
        if (raw === false) return 'locked';
        return 'visible';
    };

    const handleToggleLessonVisibility = async (e, moduleId, lessonId) => {
        e.stopPropagation();
        if (!isStaff) return;

        const normId = getNormalizedLessonId(moduleId, lessonId);
        const currentState = getLessonState(moduleId, lessonId);
        // Cycle: visible → locked → hidden → visible
        const nextState = currentState === 'visible' ? false : currentState === 'locked' ? 'hidden' : true;

        const nextLocal = { ...lessonVisibility, ...localVisibility, [normId]: nextState };
        setLocalVisibility(nextLocal);

        try {
            await api('/visibility', {
                method: 'POST',
                body: { course_id: modalCourse.id, lecciones: nextLocal }
            });
            if (refreshLessonVisibility) refreshLessonVisibility();
        } catch (err) {
            console.error('Error actualizando visibilidad de lección:', err);
        }
    };

    const handleToggleModuleVisibility = async (e, moduleId) => {
        e.stopPropagation();
        if (!isStaff) return;

        const targetModule = cModules.find(m => m.id === moduleId);
        if (!targetModule) return;

        const targetLessons = (targetModule.lessons || []).filter(l => !isExamLesson(l.id));
        const allVisible = targetLessons.every(l => isLessonItemVisible(moduleId, l.id));
        const newVis = !allVisible;

        const nextLocal = { ...lessonVisibility, ...localVisibility };
        targetLessons.forEach(l => {
            const normId = getNormalizedLessonId(moduleId, l.id);
            nextLocal[normId] = newVis;
        });

        setLocalVisibility(nextLocal);

        try {
            await api('/visibility', {
                method: 'POST',
                body: { course_id: modalCourse.id, lecciones: nextLocal }
            });
            if (refreshLessonVisibility) refreshLessonVisibility();
        } catch (err) {
            console.error('Error actualizando visibilidad del módulo:', err);
        }
    };

    const allRegularLessons = cModules.flatMap(m => 
        (m.lessons || []).filter(l => !isExamLesson(l.id)).map(l => ({ ...l, moduleId: m.id }))
    );
    const totalCourseLessonsCount = allRegularLessons.length;
    const completedInModalCourse = allRegularLessons.filter(l => 
        completedLessonsMap[l.id] || 
        completedLessonsMap[l.id.toLowerCase()] || 
        completedLessonsMap[`ee-${l.moduleId}-${l.id}`]
    ).length;
    const modalCourseProgress = totalCourseLessonsCount > 0 ? Math.round((completedInModalCourse / totalCourseLessonsCount) * 100) : 0;

    return (
        <div className="course-plan-modal-wrap">
            <div className="course-plan-header-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                        Progreso general ({completedInModalCourse}/{totalCourseLessonsCount} lecciones)
                    </span>
                    <span style={{ fontWeight: 800, color: cColor }}>
                        {modalCourseProgress}%
                    </span>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px', borderRadius: '6px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                    <div 
                        className="progress-bar-fill" 
                        style={{ 
                            width: `${Math.min(100, modalCourseProgress)}%`, 
                            background: modalCourseProgress === 100 ? '#10b981' : cColor,
                            height: '100%',
                            transition: 'width 0.4s ease'
                        }} 
                    />
                </div>
            </div>

            <div className="course-plan-accordion">
                {cModules.map((m, idx) => {
                    const isExpanded = !!expandedModules[m.id];
                    const modLessons = (m.lessons || []).filter(l => !isExamLesson(l.id));
                    const evalObj = m.evaluation;
                    const evalId = evalObj?.id || (m.lessons || []).find(l => isExamLesson(l.id))?.id;

                    const completedLessonsInMod = modLessons.filter(l => 
                        completedLessonsMap[l.id] || 
                        completedLessonsMap[l.id.toLowerCase()] || 
                        completedLessonsMap[`ee-${m.id}-${l.id}`]
                    ).length;

                    const visibleCountInMod = modLessons.filter(l => getLessonState(m.id, l.id) === 'visible').length;
                    const allModLessonsVisible = visibleCountInMod === modLessons.length;
                    const someModLessonsVisible = visibleCountInMod > 0;

                    return (
                        <div key={m.id} className={`course-module-item ${isExpanded ? 'is-expanded' : ''}`}>
                            <div className="course-module-header" onClick={() => toggleModuleExpand(m.id)}>
                                <div className="course-module-header-left">
                                    <div className="module-number-box" style={{ background: cColor }}><span>{idx + 1}</span></div>
                                    <span className="course-module-title">{m.name}</span>
                                </div>
                                <div className="course-module-header-right">
                                    {isStaff ? (
                                        <button
                                            type="button"
                                            className={`module-visibility-toggle-btn ${allModLessonsVisible ? 'all' : someModLessonsVisible ? 'partial' : 'none'}`}
                                            onClick={(e) => handleToggleModuleVisibility(e, m.id)}
                                            title={allModLessonsVisible ? 'Ocultar todo el módulo para alumnos' : 'Hacer visible todo el módulo para alumnos'}
                                        >
                                            {allModLessonsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                            <span>{visibleCountInMod}/{modLessons.length}</span>
                                        </button>
                                    ) : (
                                        <span className="module-count-badge">{completedLessonsInMod}/{modLessons.length} lecciones</span>
                                    )}
                                    <span className={`module-chevron-icon ${isExpanded ? 'rotated' : ''}`}>▾</span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="course-module-content animate-fade-in">
                                    <div className="module-lessons-list">
                                    {modLessons.map((l, lIdx) => {
                                            const isLessonCompleted = !!(completedLessonsMap[l.id] || completedLessonsMap[l.id.toLowerCase()] || completedLessonsMap[`ee-${m.id}-${l.id}`]);
                                            const lessonState = getLessonState(m.id, l.id);
                                            const isVisible = lessonState === 'visible';
                                            const isHidden = lessonState === 'hidden';
                                            const isLessonLocked = !isVisible; // locked OR hidden
                                            const lessonInfo = getLessonInfo(l.id);
                                            const lessonTitle = lessonInfo?.title || l.title || `Lección ${lIdx + 1}`;

                                            // Students don't see hidden lessons at all
                                            if (isHidden && !isStaff) return null;

                                            // Staff visibility icon config
                                            const visIconMap = {
                                                visible: { icon: <Eye size={14} />, title: 'Visible → Clic para Bloquear',   cls: 'visible' },
                                                locked:  { icon: <Lock size={14} />, title: 'Bloqueada → Clic para Ocultar', cls: 'locked'  },
                                                hidden:  { icon: <EyeOff size={14} />, title: 'Oculta → Clic para Hacer Visible', cls: 'hidden' },
                                            };
                                            const visCfg = visIconMap[lessonState];

                                            return (
                                                <div 
                                                    key={l.id} 
                                                    className={`module-lesson-row ${isLessonCompleted ? 'completed' : ''} ${isLessonLocked && !isHidden ? 'locked' : ''} ${isHidden ? 'hidden-lesson' : ''}`}
                                                    onClick={() => {
                                                        if (!isLessonLocked || isStaff) {
                                                            setActiveLessonModal({
                                                                courseId: modalCourse.slug || modalCourse.abbr || 're',
                                                                moduleId: m.id,
                                                                lessonId: l.id
                                                            });
                                                        }
                                                    }}
                                                    style={{ cursor: (!isLessonLocked || isStaff) ? 'pointer' : 'default', opacity: isHidden ? 0.45 : 1 }}
                                                >
                                                    <div className="module-lesson-row-left">
                                                        <div className={`lesson-status-icon ${isLessonCompleted ? 'completed' : isHidden ? 'hidden' : isLessonLocked ? 'locked' : 'ready'}`}>
                                                            {isLessonCompleted ? <Check size={13} strokeWidth={3} /> : isHidden ? <EyeOff size={11} /> : isLessonLocked ? <Lock size={12} /> : <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{lIdx + 1}</span>}
                                                        </div>
                                                        <div className="module-lesson-info">
                                                            <span className="module-lesson-title">{lessonTitle}</span>
                                                        </div>
                                                    </div>
                                                    <div className="module-lesson-row-right">
                                                        {isStaff ? (
                                                            <button
                                                                type="button"
                                                                className={`lesson-visibility-toggle-btn icon-only ${visCfg.cls}`}
                                                                onClick={(e) => handleToggleLessonVisibility(e, m.id, l.id)}
                                                                title={visCfg.title}
                                                            >
                                                                {visCfg.icon}
                                                            </button>
                                                        ) : (
                                                            <>
                                                                {isLessonCompleted ? <span className="badge-pill done">✓ Superada</span> : isLessonLocked ? <span className="badge-pill locked">🔒 Bloqueada</span> : <span className="badge-pill ready">Disponible</span>}
                                                            </>
                                                        )}
                                                        {isLessonLocked && !isStaff ? (
                                                            <div className="action-btn-mini locked" title="Bloqueado por el docente"><Lock size={13} /></div>
                                                        ) : isHidden && isStaff ? (
                                                            <div className="action-btn-mini locked" title="Oculta para alumnos" style={{ opacity: 0.5 }}><EyeOff size={13} /></div>
                                                        ) : (
                                                            <button 
                                                                type="button"
                                                                className="action-btn-mini present" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveLessonModal({
                                                                        courseId: modalCourse.slug || modalCourse.abbr || 're',
                                                                        moduleId: m.id,
                                                                        lessonId: l.id
                                                                    });
                                                                }} 
                                                                title={isLessonCompleted ? 'Repasar Lección' : 'Comenzar Lección'}
                                                            >
                                                                <Play size={13} fill="currentColor" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal de Visor de Lección */}
            {activeLessonModal && (
                <LessonModalViewer
                    courseId={activeLessonModal.courseId}
                    moduleId={activeLessonModal.moduleId}
                    lessonId={activeLessonModal.lessonId}
                    onClose={() => setActiveLessonModal(null)}
                    onLessonCompleted={(lessonKey) => {
                        if (refreshLessonVisibility) refreshLessonVisibility();
                    }}
                />
            )}
        </div>
    );
};

export default CoursesModalContent;
