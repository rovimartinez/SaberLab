import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, EyeOff, Lock, Play } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export const ActivitiesModalContent = ({
    courseGroups = [],
    filteredCourseGroups = [],
    modalCourseFilter = 'all',
    setModalCourseFilter,
    upcomingActivities = [],
    getCourseIcon,
    isStaff = false,
    lessonVisibility = {},
    onClose
}) => {
    const { refreshLessonVisibility } = useAuth() || {};
    const [localVisibility, setLocalVisibility] = useState({});

    const isExamItemVisible = (courseId, evalKey) => {
        const normKey = (evalKey || '').toLowerCase();
        if (localVisibility.hasOwnProperty(normKey)) return localVisibility[normKey];
        if (localVisibility.hasOwnProperty(evalKey)) return localVisibility[evalKey];
        if (lessonVisibility.hasOwnProperty(normKey)) return lessonVisibility[normKey];
        if (lessonVisibility.hasOwnProperty(evalKey)) return lessonVisibility[evalKey];
        
        const cVis = (lessonVisibility && (lessonVisibility[courseId] || lessonVisibility[String(courseId)])) || {};
        if (cVis.hasOwnProperty(normKey)) return cVis[normKey];
        if (cVis.hasOwnProperty(evalKey)) return cVis[evalKey];
        return true;
    };

    const handleToggleExamVisibility = async (e, courseId, evalKey) => {
        e.stopPropagation();
        if (!isStaff) return;

        const normKey = (evalKey || '').toLowerCase();
        const currentVis = isExamItemVisible(courseId, evalKey);
        const newVis = !currentVis;

        const nextLocal = { ...lessonVisibility, ...localVisibility, [normKey]: newVis, [evalKey]: newVis };
        setLocalVisibility(nextLocal);

        try {
            await api('/visibility', {
                method: 'POST',
                body: { course_id: courseId, lecciones: nextLocal }
            });
            if (refreshLessonVisibility) refreshLessonVisibility();
        } catch (err) {
            console.error('Error actualizando visibilidad del examen:', err);
        }
    };

    return (
        <>
            {/* Barra de Filtros por Curso */}
            {courseGroups.length > 1 && (
                <div className="modal-course-tabs">
                    <button
                        type="button"
                        className={`modal-course-pill ${modalCourseFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setModalCourseFilter('all')}
                    >
                        <span>Todos los Cursos</span>
                        <span className="pill-count">{upcomingActivities.length}</span>
                    </button>
                    {courseGroups.map(g => (
                        <button
                            key={g.courseId}
                            type="button"
                            className={`modal-course-pill ${modalCourseFilter === g.courseId ? 'active' : ''}`}
                            style={modalCourseFilter === g.courseId ? { borderColor: g.courseColor, color: g.courseColor } : {}}
                            onClick={() => setModalCourseFilter(g.courseId)}
                        >
                            <span className="course-dot" style={{ background: g.courseColor }} />
                            <span>{g.courseName}</span>
                            <span className="pill-count">{g.activities.length}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="course-grouped-agenda">
                {filteredCourseGroups.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Clock size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                        No hay exámenes oficiales registrados en esta sección.
                    </div>
                ) : (
                    filteredCourseGroups.map(group => (
                        <div key={group.courseId} className="modal-course-section">
                            <div className="modal-course-header-row" style={{ borderLeftColor: group.courseColor }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <div className="course-section-icon" style={{ background: `${group.courseColor}20`, color: group.courseColor }}>
                                        {getCourseIcon(group.courseAbbr)}
                                    </div>
                                    <div>
                                        <h3 className="course-section-title">{group.courseName}</h3>
                                        <span className="course-section-progress">
                                            {group.doneCount} de {group.totalCount} evaluados • {group.totalPoints} / {group.maxPoints} pts
                                        </span>
                                    </div>
                                </div>
                                <span className="course-section-tag" style={{ background: `${group.courseColor}20`, color: group.courseColor }}>
                                    {group.courseAbbr}
                                </span>
                            </div>

                            <div className="agenda-items-container">
                                {group.activities.map(act => {
                                    const isVisible = isExamItemVisible(group.courseId, act.evalKey);
                                    const isLocked = !isVisible;

                                    return (
                                        <div 
                                            key={act.id} 
                                            className="agenda-item-row"
                                            style={act.isDone ? { borderColor: 'rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.04)' } : (isLocked ? { opacity: 0.85 } : {})}
                                        >
                                            <div className="agenda-item-left">
                                                <div className="agenda-badge-row">
                                                    {act.isDone ? (
                                                        <span className="badge-pill done">✓ Rendido</span>
                                                    ) : isLocked ? (
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

                                            <div className="agenda-item-right" style={{ gap: '0.65rem' }}>
                                                {/* 1. Puntos */}
                                                <div className={`score-badge ${act.isDone ? 'done' : ''}`}>
                                                    <span className="score-num">{act.isDone ? act.pointsEarned : act.points}</span>
                                                    <span className="score-txt">pts</span>
                                                </div>

                                                {/* 2. Play / Acceso */}
                                                {act.isDone ? (
                                                    <Link 
                                                        to={`/dashboard/evaluations/${act.evalKey}/play?review=true`} 
                                                        className="action-btn-mini present"
                                                        onClick={onClose} 
                                                        title="Ver / Entrar a la evaluación"
                                                    >
                                                        <Play size={13} fill="currentColor" />
                                                    </Link>
                                                ) : isLocked && !isStaff ? (
                                                    <div 
                                                        className="action-btn-mini locked"
                                                        title="Examen bloqueado por el docente"
                                                    >
                                                        <Lock size={13} />
                                                    </div>
                                                ) : (
                                                    <Link 
                                                        to={`/dashboard/evaluations/${act.evalKey}/play`} 
                                                        className="action-btn-mini present"
                                                        onClick={onClose} 
                                                        title="Entrar al examen"
                                                    >
                                                        <Play size={13} fill="currentColor" />
                                                    </Link>
                                                )}

                                                {/* 3. Ojito / Candado (Visibilidad docente) */}
                                                {isStaff && (
                                                    <button
                                                        type="button"
                                                        className={`lesson-visibility-toggle-btn icon-only ${isVisible ? 'visible' : 'locked'}`}
                                                        onClick={(e) => handleToggleExamVisibility(e, group.courseId, act.evalKey)}
                                                        title={isVisible ? 'Examen Visible para alumnos (Clic para Bloquear)' : 'Examen Bloqueado para alumnos (Clic para Hacer Visible)'}
                                                    >
                                                        {isVisible ? <Eye size={14} /> : <Lock size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default ActivitiesModalContent;
