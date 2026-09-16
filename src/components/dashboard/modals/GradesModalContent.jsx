import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Lock, Play } from 'lucide-react';

export const GradesModalContent = ({
    courseGroups = [],
    filteredCourseGroups = [],
    modalCourseFilter = 'all',
    setModalCourseFilter,
    upcomingActivities = [],
    getCourseIcon,
    onClose
}) => {
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
                        No hay evaluaciones registradas en esta sección.
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
                                            {group.doneCount} de {group.totalCount} evaluados • {group.totalPoints} / {group.maxPoints} pts acumulados
                                        </span>
                                    </div>
                                </div>
                                <span className="course-section-tag" style={{ background: `${group.courseColor}20`, color: group.courseColor }}>
                                    {group.courseAbbr}
                                </span>
                            </div>

                            <div className="agenda-items-container">
                                {group.activities.map(act => (
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
                                                    <span className="badge-pill upcoming">📅 Pendiente</span>
                                                )}
                                                <span className="badge-date">{act.date}</span>
                                            </div>
                                            <div className="agenda-item-title">{act.title}</div>
                                        </div>

                                        <div className="agenda-item-right">
                                            {act.isDone ? (
                                                <Link 
                                                    to={`/dashboard/evaluations/${act.evalKey}/play?review=true`} 
                                                    className="action-btn-mini review"
                                                    onClick={onClose}
                                                    title="Ver Revisión"
                                                >
                                                    <Eye size={13} />
                                                </Link>
                                            ) : act.isLocked ? (
                                                <div className="action-btn-mini locked" style={{ opacity: 0.6 }}>
                                                    <Lock size={13} />
                                                </div>
                                            ) : (
                                                <Link 
                                                    to={`/dashboard/evaluations/${act.evalKey}`} 
                                                    className="action-btn-mini present"
                                                    onClick={onClose}
                                                    title="Presentar Examen"
                                                >
                                                    <Play size={13} fill="currentColor" />
                                                </Link>
                                            )}
                                            <div className={`score-badge ${act.isDone ? 'done' : ''}`}>
                                                <span className="score-num">{act.isDone ? act.pointsEarned : act.points}</span>
                                                <span className="score-txt">pts</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default GradesModalContent;
