import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Lock, Check, Clock, Play } from 'lucide-react';
import { LESSONS_REGISTRY } from '../../data/coursesData';
import { useAuth } from '../../context/useAuth';
import { api } from '../../lib/api';

const normalizeLessonId = (rawId, moduleId, abbr) => {
    if (!rawId) return '';
    const cleanRaw = String(rawId).toLowerCase();
    if (cleanRaw.includes('-')) return cleanRaw;
    const cleanMod = moduleId ? String(moduleId).toLowerCase() : 'm1';
    const cleanLes = cleanRaw.startsWith('l') ? cleanRaw : `l${cleanRaw}`;
    return `${abbr.toLowerCase()}-${cleanMod}-${cleanLes}`;
};

const CourseNavTree = ({ subject, currentLessonId, closeSidebar, isCompact = false }) => {
    const navigate = useNavigate();
    const { profile, lessonVisibility = {} } = useAuth();
    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);
    const [completedLessons, setCompletedLessons] = useState({});

    const courseVisibility = lessonVisibility[subject?.id] || {};

    // Identificar el módulo de la lección actual
    const activeModuleId = useMemo(() => {
        if (!subject?.modules || !currentLessonId) return null;
        const normalizedTarget = currentLessonId.toLowerCase();
        const found = subject.modules.find(mod =>
            mod.lessons.some(l => {
                const norm = normalizeLessonId(l.id, mod.id, subject.abbr);
                return norm === normalizedTarget || String(l.id).toLowerCase() === normalizedTarget;
            })
        );
        return found ? found.id : null;
    }, [subject, currentLessonId]);

    // Estado de módulos expandidos: Inicializa con el módulo activo desplegado
    const [expandedModules, setExpandedModules] = useState(() => {
        if (activeModuleId) {
            return { [activeModuleId]: true };
        }
        return { [subject?.modules?.[0]?.id || 'm1']: true };
    });

    // Cargar progreso real del estudiante desde Cloudflare D1
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
                console.error('Error cargando progreso en CourseNavTree:', err);
            }
        };

        fetchProgress();

        const handleUpdate = () => fetchProgress();
        window.addEventListener('lesson-progress-updated', handleUpdate);
        return () => window.removeEventListener('lesson-progress-updated', handleUpdate);
    }, []);

    // Desplegar automáticamente el módulo cuando cambie la lección actual
    useEffect(() => {
        if (activeModuleId) {
            setExpandedModules({ [activeModuleId]: true });
        }
    }, [activeModuleId]);

    if (!subject || !subject.modules) return null;

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => {
            const isCurrentlyOpen = Boolean(prev[moduleId]);
            // Al abrir un módulo, se cierra automáticamente el que estaba abierto
            return isCurrentlyOpen ? {} : { [moduleId]: true };
        });
    };

    const handleLessonClick = (lessonId, isLocked) => {
        if (isLocked) return;

        const targetModule = subject.modules.find(mod => 
            mod.lessons.some(l => {
                const norm = normalizeLessonId(l.id, mod.id, subject.abbr);
                return norm === lessonId.toLowerCase() || String(l.id).toLowerCase() === lessonId.toLowerCase();
            })
        );
        if (!targetModule) return;

        const lessonShortId = lessonId.split('-').pop();
        navigate(`/dashboard/my-courses/${subject.slug}/${targetModule.id}/${lessonShortId}`);
        
        if (closeSidebar && window.innerWidth < 1024) {
            closeSidebar();
        }
    };

    const getLessonStatus = (fullId) => {
        const normalizedId = fullId.toLowerCase();
        const visibility = courseVisibility[normalizedId];
        if (visibility === false && !isStaff) return 'locked';

        const normalizedTarget = (currentLessonId || '').toLowerCase();
        if (normalizedId === normalizedTarget) {
            return 'active';
        }

        if (completedLessons[normalizedId]) return 'completed';
        if (isStaff) return 'available';

        const allLessons = subject.modules.flatMap(m => m.lessons.map(l => normalizeLessonId(l.id, m.id, subject.abbr)));
        const thisIdx = allLessons.indexOf(normalizedId);
        if (thisIdx <= 0) return 'available';

        const previousId = allLessons[thisIdx - 1];
        const isPrevDone = completedLessons[previousId];

        return isPrevDone ? 'available' : 'locked';
    };

    const themeColor = subject.color || '#38bdf8';

    return (
        <div className="cs-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, width: '100%', boxSizing: 'border-box' }}>
            {subject.modules.map((module) => {
                const isExpanded = expandedModules[module.id];
                const moduleName = module.name || module.title || 'Módulo';
                const containsActive = module.lessons.some(l => {
                    const norm = normalizeLessonId(l.id, module.id, subject.abbr);
                    return norm === currentLessonId?.toLowerCase() || String(l.id).toLowerCase() === currentLessonId?.toLowerCase();
                });

                return (
                    <div 
                        key={module.id} 
                        className={`cs-module-group ${isExpanded ? 'is-expanded' : ''}`}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            borderRadius: '14px',
                            background: isExpanded ? 'var(--surface-card)' : 'var(--surface-card-subtle)',
                            border: isExpanded && containsActive 
                                ? `1px solid ${themeColor}40`
                                : '1px solid var(--border-subtle)',
                            boxShadow: isExpanded ? 'var(--shadow-card)' : 'none',
                            overflow: 'hidden',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <button
                            type="button"
                            className="cs-module-header"
                            onClick={() => toggleModule(module.id)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                padding: isCompact ? '0.6rem 0.4rem' : '0.75rem 0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                color: 'var(--text-heading)',
                                textAlign: 'left'
                            }}
                            title={moduleName}
                        >
                            {!isCompact ? (
                                <>
                                    <div className="cs-module-title-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                            background: containsActive ? themeColor : 'var(--border-strong)',
                                            boxShadow: containsActive ? `0 0 8px ${themeColor}` : 'none',
                                            flexShrink: 0
                                        }} />
                                        <span className="cs-module-title" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.3 }}>
                                            {moduleName}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '6px', display: 'flex', alignItems: 'center' }}>
                                        <ChevronDown 
                                            size={16} 
                                            style={{ 
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                                            }} 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: containsActive ? themeColor : 'var(--border-strong)',
                                        boxShadow: containsActive ? `0 0 8px ${themeColor}` : 'none'
                                    }} />
                                </div>
                            )}
                        </button>

                        {!isCompact && (
                            <div 
                                style={{
                                    display: 'grid',
                                    gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                    opacity: isExpanded ? 1 : 0,
                                    transition: 'grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ minHeight: 0, overflow: 'hidden' }}>
                                    <div className="cs-lessons-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 0.5rem 0.75rem 0.5rem' }}>
                                {module.lessons.map((lessonRef) => {
                                    const rawId = lessonRef.id;
                                    const fullId = normalizeLessonId(rawId, module.id, subject.abbr);
                                    const lessonInfo = LESSONS_REGISTRY[fullId] || LESSONS_REGISTRY[rawId] || {};
                                    const lessonTitle = lessonInfo.title || lessonRef.title || 'Lección';

                                    const status = getLessonStatus(fullId);
                                    const isLocked = status === 'locked';
                                    const isActive = status === 'active';
                                    const isCompleted = status === 'completed';

                                    // Colores y badges reactivos al estado
                                    const itemBg = isActive
                                        ? `color-mix(in srgb, ${themeColor} 14%, var(--surface-card))`
                                        : isCompleted
                                        ? 'transparent'
                                        : 'transparent';

                                    const itemBorder = isActive
                                        ? `1px solid ${themeColor}55`
                                        : '1px solid transparent';

                                    return (
                                        <button
                                            key={lessonRef.id}
                                            type="button"
                                            className={`cs-lesson-item ${status}`}
                                            onClick={() => handleLessonClick(fullId, isLocked)}
                                            disabled={isLocked}
                                            style={{
                                                background: itemBg,
                                                border: itemBorder,
                                                borderRadius: '10px',
                                                padding: '0.65rem 0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '8px',
                                                width: '100%',
                                                textAlign: 'left',
                                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                                opacity: isLocked ? 0.45 : 1,
                                                position: 'relative',
                                                transition: 'all 0.2s ease',
                                                boxShadow: isActive ? `0 2px 10px ${themeColor}20` : 'none'
                                            }}
                                        >
                                            {isActive && (
                                                <div 
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '12%',
                                                        bottom: '12%',
                                                        width: '3.5px',
                                                        borderTopRightRadius: '3px',
                                                        borderBottomRightRadius: '3px',
                                                        background: themeColor
                                                    }} 
                                                />
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                                {/* Bolita de Estado con Icono Representativo */}
                                                <div 
                                                    style={{
                                                        width: '22px',
                                                        height: '22px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        transition: 'all 0.2s ease',
                                                        ...(isLocked ? {
                                                            background: 'var(--surface-hover)',
                                                            border: '1px dashed var(--border-strong)',
                                                            color: 'var(--text-muted)',
                                                            opacity: 0.7
                                                        } : isCompleted ? {
                                                            background: 'rgba(16, 185, 129, 0.15)',
                                                            border: '1.5px solid #10b981',
                                                            color: '#10b981',
                                                            boxShadow: isActive ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none'
                                                        } : isActive ? {
                                                            background: `color-mix(in srgb, ${themeColor} 22%, transparent)`,
                                                            border: `1.5px solid ${themeColor}`,
                                                            color: themeColor,
                                                            boxShadow: `0 0 10px ${themeColor}40`
                                                        } : {
                                                            background: 'var(--surface-card-subtle)',
                                                            border: '1px solid var(--border-subtle)',
                                                            color: 'var(--text-muted)'
                                                        })
                                                    }}
                                                    title={
                                                        isLocked ? 'Lección bloqueada' :
                                                        isCompleted ? 'Lección terminada' :
                                                        isActive ? 'Lección en curso' :
                                                        'Lección pendiente'
                                                    }
                                                >
                                                    {isLocked ? (
                                                        <Lock size={12} strokeWidth={2.2} />
                                                    ) : isCompleted ? (
                                                        <Check size={12} strokeWidth={3} />
                                                    ) : isActive ? (
                                                        <Play size={10} fill={themeColor} strokeWidth={0} style={{ marginLeft: '1px' }} />
                                                    ) : (
                                                        <Clock size={11} strokeWidth={2.2} />
                                                    )}
                                                </div>

                                                <span 
                                                    style={{
                                                        fontSize: '0.82rem',
                                                        fontWeight: isActive ? 700 : 500,
                                                        color: isActive 
                                                            ? 'var(--text-heading)' 
                                                            : isCompleted 
                                                            ? 'var(--text-body)' 
                                                            : 'var(--text-secondary)',
                                                        lineHeight: 1.35,
                                                        flex: 1,
                                                        minWidth: 0,
                                                        wordBreak: 'normal',
                                                        overflowWrap: 'break-word',
                                                        hyphens: 'none'
                                                    }}
                                                >
                                                    {lessonTitle}
                                                </span>
                                            </div>


                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                    </div>
                );
            })}
        </div>
    );
};

export default CourseNavTree;
