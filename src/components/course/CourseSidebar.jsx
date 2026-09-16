import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Layers, CheckCircle2, FileText, X, Lock, PlayCircle, Circle, Award } from 'lucide-react';
import { LESSONS_REGISTRY } from '../../data/coursesData';
import { useAuth } from '../../context/useAuth';
import { api } from '../../lib/api';
import '../../styles/CourseSidebar.css';

const CourseSidebar = ({ subject, currentLessonId, isOpen, toggleSidebar, lessonVisibility = {} }) => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);
    const [expandedModules, setExpandedModules] = useState({});
    const [completedLessons, setCompletedLessons] = useState({});

    // Cargar progreso real del estudiante desde D1
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const { data } = await api('/lesson-progress');
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach(item => {
                        if (item.status === 'completed' || item.progress >= 100 || (typeof item.score === 'number' && item.score >= 80)) {
                            map[item.lesson_id.toLowerCase()] = true;
                        }
                    });
                    setCompletedLessons(map);
                }
            } catch (err) {
                console.error('Error cargando progreso en CourseSidebar:', err);
            }
        };

        fetchProgress();

        const handleUpdate = () => fetchProgress();
        window.addEventListener('lesson-progress-updated', handleUpdate);
        return () => window.removeEventListener('lesson-progress-updated', handleUpdate);
    }, []);

    // Automatically expand the current module when the sidebar opens or the lesson changes
    useEffect(() => {
        if (subject && subject.modules && currentLessonId) {
            const cleanCurId = currentLessonId.toLowerCase();
            const curShort = cleanCurId.split('-').pop();

            const currentModule = subject.modules.find(mod => 
                mod.lessons.some(l => {
                    const lClean = l.id.toLowerCase();
                    const lShort = lClean.split('-').pop();
                    return lClean === cleanCurId || lShort === cleanCurId || lClean === curShort || lShort === curShort;
                })
            );
            if (currentModule) {
                setExpandedModules(prev => ({
                    ...prev,
                    [currentModule.id]: true
                }));
            }
        }
    }, [subject, currentLessonId]);

    if (!subject || !subject.modules) return null;

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleLessonClick = (lessonId, isLocked) => {
        if (isLocked) return; // Don't navigate if locked

        const targetModule = subject.modules.find(mod => mod.lessons.some(l => l.id === lessonId));
        if (!targetModule) return;

        const normId = (lessonId.includes('-') ? lessonId : `${subject.abbr.toLowerCase()}-${targetModule.id}-${lessonId}`).toLowerCase();
        const isOfficialExam = normId.endsWith('e') || normId.includes('exam') || normId.includes('eval');

        if (isOfficialExam) {
            navigate(`/dashboard/evaluations/${normId}`);
        } else {
            const lessonShortId = lessonId.split('-').pop(); // 're-m1-l1' -> 'l1'
            navigate(`/dashboard/my-courses/${subject.slug}/${targetModule.id}/${lessonShortId}`);
        }
        
        if (window.innerWidth < 1024) {
            toggleSidebar();
        }
    };

    // Lógica de Visibilidad y Estado de Lección en el Sidebar
    const getLessonStatus = (lessonId, moduleId = 'm1') => {
        const rawId = (lessonId || '').toLowerCase();
        const shortId = rawId.split('-').pop(); // 'l1'
        const normalizedId = rawId.includes('-') 
            ? rawId 
            : `${subject?.abbr?.toLowerCase() || 're'}-${moduleId.toLowerCase()}-${rawId}`;

        // 1. Visibilidad explícita del docente en BD (Copia exacta de lo que ve el Admin)
        const visibility = lessonVisibility[normalizedId] ?? lessonVisibility[rawId] ?? lessonVisibility[shortId];
        if (visibility === false && !isStaff) return 'locked';

        // 2. Lección actual que se está cursando
        const cleanCur = (currentLessonId || '').toLowerCase();
        const curShort = cleanCur.split('-').pop();
        if (rawId === cleanCur || normalizedId === cleanCur || shortId === curShort) return 'active';

        // 3. Verificación de Lección Completada (aprobada con >= 80% o marcada como completada)
        const isDone = !!(
            completedLessons[normalizedId] || 
            completedLessons[rawId] || 
            completedLessons[shortId] || 
            completedLessons[`${subject?.abbr?.toLowerCase() || 're'}-${moduleId}-${shortId}`]
        );
        if (isDone) return 'completed';

        // 4. Si el docente la tiene visible (o es staff), la lección está disponible
        return 'available';
    };

    return (
        <>
            <div className={`course-sidebar ${isOpen ? 'open' : ''}`}>
                <button 
                    className="course-sidebar-handle"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSidebar();
                    }}
                    title={isOpen ? "Cerrar mapa del curso" : "Abrir mapa de lecciones del curso"}
                    aria-label="Mapa de lecciones del curso"
                >
                    <div className="handle-arrow">
                        {isOpen ? <X size={20} /> : <FileText size={20} />}
                    </div>
                </button>

                <div className="course-sidebar-wrapper">
                    <div className="cs-header">
                        <div className="cs-icon-box" style={{ background: `${subject.color}20`, color: subject.color }}>
                            <Layers size={20} />
                        </div>
                        <div className="cs-header-info">
                            <h3>Mapa del Curso</h3>
                            <p>{subject.name}</p>
                        </div>
                    </div>

                    <div className="cs-content">
                        {subject.modules.map((module, mIdx) => {
                            const isExpanded = expandedModules[module.id];
                            const containsActive = module.lessons.some(l => l.id === currentLessonId);
                            
                            return (
                                <div key={module.id} className={`cs-module-group ${isExpanded ? 'is-expanded' : ''}`}>
                                    <button 
                                        className={`cs-module-header ${containsActive ? 'has-active' : ''}`}
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="cs-module-title-box">
                                            <span className="cs-module-title">{module.name}</span>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    <div className="cs-lessons-list">
                                        {module.lessons
                                            .filter((lessonRef) => {
                                                const normId = (lessonRef.id.includes('-') ? lessonRef.id : `${subject.abbr.toLowerCase()}-${module.id}-${lessonRef.id}`).toLowerCase();
                                                const isOfficialExam = normId.endsWith('e') || normId.includes('exam') || normId.includes('eval');
                                                // Las evaluaciones no deben aparecer en el mapa de lecciones para los estudiantes, ya que se gestionan en el módulo central de Evaluaciones
                                                if (isOfficialExam && !isStaff) return false;
                                                return true;
                                            })
                                            .map((lessonRef) => {
                                            const lessonInfo = LESSONS_REGISTRY[lessonRef.id];
                                            const status = getLessonStatus(lessonRef.id, module.id);
                                            const isActive = status === 'active';
                                            const isLocked = status === 'locked';
                                            const isCompleted = status === 'completed';
                                            
                                            const normId = (lessonRef.id.includes('-') ? lessonRef.id : `${subject.abbr.toLowerCase()}-${module.id}-${lessonRef.id}`).toLowerCase();
                                            const isOfficialExam = normId.endsWith('e') || normId.includes('exam') || normId.includes('eval');
                                            
                                            return (
                                                <button 
                                                    key={lessonRef.id}
                                                    className={`cs-lesson-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${isOfficialExam ? 'is-exam-item' : ''}`}
                                                    onClick={() => handleLessonClick(lessonRef.id, isLocked)}
                                                    style={{ 
                                                        '--accent': isOfficialExam ? '#f59e0b' : subject.color,
                                                        background: isOfficialExam ? 'rgba(245, 158, 11, 0.08)' : undefined,
                                                        border: isOfficialExam ? '1px dashed rgba(245, 158, 11, 0.4)' : undefined
                                                    }}
                                                    disabled={isLocked}
                                                    title={isOfficialExam ? 'Examen Oficial del Módulo' : undefined}
                                                >
                                                    <div className="cs-lesson-status">
                                                        {isLocked ? (
                                                            <Lock size={14} className="status-icon-locked" />
                                                        ) : isOfficialExam ? (
                                                            <Award size={16} color="#f59e0b" />
                                                        ) : (
                                                            <div className={`status-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} />
                                                        )}
                                                    </div>
                                                    <div className="cs-lesson-text">
                                                        <span className="cs-lesson-title" style={{ color: isOfficialExam ? '#fbbf24' : undefined, fontWeight: isOfficialExam ? 700 : undefined }}>
                                                            {isOfficialExam ? `🏆 ${lessonInfo?.title || 'Examen Oficial'}` : (lessonInfo?.title || 'Lección')}
                                                        </span>
                                                    </div>
                                                    {isActive && <div className="cs-lesson-indicator" style={{ background: isOfficialExam ? '#f59e0b' : subject.color }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {isOpen && <div className="course-sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default CourseSidebar;
