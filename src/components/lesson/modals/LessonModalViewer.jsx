import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
    X,
    ArrowLeft,
    BookOpen,
    Bot,
    Brain,
    CheckCircle,
    ChevronRight,
    ClipboardList,
    Rocket,
    Lock,
    Sparkles,
    Check
} from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { l1Missions } from '../../../lessons/RE/m1/l1.missions';
import { l2Missions } from '../../../lessons/RE/m1/l2.missions';
import { l3Missions } from '../../../lessons/RE/m1/l3.missions';
import { l4Missions } from '../../../lessons/RE/m1/l4.missions';
import {
    COURSES_DEFINITION,
    getCourseByIdentifier,
    getFullLessonPath,
    getLessonContent,
    getNextLesson,
    getPreviousLesson
} from '../../../data/coursesData.jsx';
import LessonRenderer from '../LessonRenderer';
import LessonLegacyBridge from '../legacy/LessonLegacyBridge';
import ArduinoPartsModal from './ArduinoPartsModal';
import GuideModal from './GuideModal';
import { saveContentEvent } from '../../../lib/learningAnalytics';
import { normalizeLessonData } from '../../../lib/lessonSchema';
import { fetchLessonProgress, upsertLessonProgress } from '../../../lib/studentProgress';
import Celebration from '../../celebration/Celebration';
import RewardBanner from '../../celebration/RewardBanner';
import RewardDialog from '../../celebration/RewardDialog';
import { getGadgetUnlockedByLesson } from '../../../data/gadgetsData';
import '../../../styles/Lesson.css';
import '../../../styles/LessonModalViewer.css';

const TABS = [
    { id: 'contenido', label: 'Contenido', icon: <BookOpen size={17} /> },
    { id: 'repaso', label: 'Repaso', icon: <Brain size={17} /> },
    { id: 'simulador', label: 'Práctica', icon: <Rocket size={17} /> },
    { id: 'prueba', label: 'Prueba', icon: <ClipboardList size={17} /> }
];

const lessonMissionsMap = {
    're-m1-l1': l1Missions,
    're-m1-l2': l2Missions,
    're-m1-l3': l3Missions,
    're-m1-l4': l4Missions
};

export const LessonModalViewer = ({
    courseId,
    moduleId,
    lessonId,
    onClose,
    onLessonCompleted
}) => {
    const { user, profile, lessonVisibility } = useAuth();

    // Estado para permitir navegación fluida entre lecciones dentro del modal
    const [currentCourseId, setCurrentCourseId] = useState(courseId);
    const [currentModuleId, setCurrentModuleId] = useState(moduleId);
    const [currentLessonId, setCurrentLessonId] = useState(lessonId);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        setCurrentCourseId(courseId);
        setCurrentModuleId(moduleId);
        setCurrentLessonId(lessonId);
    }, [courseId, moduleId, lessonId]);

    const courseData = useMemo(() => getCourseByIdentifier(currentCourseId), [currentCourseId]);
    const courseCode = courseData ? courseData.abbr.toLowerCase() : (currentCourseId || 're').toLowerCase();
    const courseVisibility = (courseData && lessonVisibility[courseData.id]) || {};

    const internalId = useMemo(() => {
        if (!currentLessonId) return '';
        if (currentLessonId.includes('-')) return currentLessonId.toLowerCase();
        const cleanMod = currentModuleId ? currentModuleId.toLowerCase() : 'm1';
        const cleanLes = currentLessonId.toLowerCase().startsWith('l') ? currentLessonId.toLowerCase() : `l${currentLessonId.toLowerCase()}`;
        return `${courseCode}-${cleanMod}-${cleanLes}`;
    }, [courseCode, currentModuleId, currentLessonId]);

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);
    const isLockedByVisibility = !isStaff && courseVisibility[internalId] === false;

    // Ocultar pestaña "Práctica" para estudiantes (solo staff/docentes pueden verla)
    const activeTabs = useMemo(() => {
        return TABS.filter(tab => tab.id !== 'simulador' || isStaff);
    }, [isStaff]);

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contenido');

    useEffect(() => {
        if (!isStaff && activeTab === 'simulador') {
            setActiveTab('contenido');
        }
    }, [isStaff, activeTab]);
    const [showGuide, setShowGuide] = useState(false);
    const [showArduinoParts, setShowArduinoParts] = useState(false);
    const [activeChallenge, setActiveChallenge] = useState(0);
    const [showSimulator, setShowSimulator] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [rewardGadget, setRewardGadget] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [lessonProgress, setLessonProgress] = useState(null);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const hasTrackedInitialTabRef = useRef(false);
    const modalContentRef = useRef(null);

    // Cargar progreso de la lección
    const checkProgress = useCallback(async () => {
        if (!user?.id || !internalId) return;
        try {
            const prog = await fetchLessonProgress(user.id, internalId);
            setLessonProgress(prog || null);
            if (prog && (prog.status === 'completed' || prog.progress === 100 || (typeof prog.score === 'number' && prog.score >= 80))) {
                setIsCompleted(true);
            } else {
                setIsCompleted(false);
            }
        } catch (err) {
            console.error('Error cargando progreso de lección en modal:', err);
        }
    }, [user?.id, internalId]);

    useEffect(() => {
        checkProgress();
    }, [checkProgress]);

    useEffect(() => {
        const handleProgressEvent = () => checkProgress();
        window.addEventListener('lesson-progress-updated', handleProgressEvent);
        return () => window.removeEventListener('lesson-progress-updated', handleProgressEvent);
    }, [checkProgress]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Cargar contenido de la lección
    useEffect(() => {
        let isMounted = true;
        const loadLesson = async () => {
            setLoading(true);
            try {
                const data = await getLessonContent(internalId);
                if (isMounted) {
                    setLesson(data);
                    setActiveTab('contenido');
                    if (modalContentRef.current) {
                        modalContentRef.current.scrollTop = 0;
                    }
                }
            } catch (error) {
                console.error('Error cargando lección en modal:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadLesson();
        return () => { isMounted = false; };
    }, [internalId]);

    const lessonPath = useMemo(() => getFullLessonPath(internalId), [internalId]);
    const moduleInfo = (lessonPath && lessonPath.module) || { name: 'Módulo 1' };
    const subject = (lessonPath && lessonPath.course) || { name: 'Robótica Educativa', color: '#a855f7', icon: <Bot size={22} />, abbr: 'RE' };
    const resolvedMissions = lessonMissionsMap[internalId] || [];
    const lessonKey = internalId;
    const prevLesson = useMemo(() => getPreviousLesson(internalId), [internalId]);
    const nextLesson = useMemo(() => getNextLesson(internalId), [internalId]);

    const isStartOfModule = useMemo(() => {
        if (!prevLesson) return true;
        const currentModId = lessonPath?.module?.id || moduleInfo?.id || currentModuleId;
        return prevLesson.moduleId !== currentModId;
    }, [prevLesson, lessonPath, moduleInfo, currentModuleId]);

    const isNextAnExam = useMemo(() => {
        if (!nextLesson) return false;
        const id = (nextLesson.fullId || nextLesson.shortId || '').toLowerCase();
        return id.endsWith('-l6') || id.endsWith('-l10') || id.endsWith('-l14') || id.endsWith('-l16') || id === 'l6' || id === 'l10' || id === 'l14' || id === 'l16' || nextLesson.title?.toLowerCase().includes('examen');
    }, [nextLesson]);

    const normalizedLesson = useMemo(() =>
        lesson
            ? normalizeLessonData({ lesson, lessonKey, missions: resolvedMissions })
            : { blocksByTab: {} },
        [lesson, lessonKey, resolvedMissions]);

    const tabBlocks = normalizedLesson.blocksByTab?.[activeTab] || [];

    const handleCompleteLesson = async () => {
        if (!user) return;
        setIsSavingProgress(true);
        try {
            const saved = await upsertLessonProgress({
                user_id: user.id,
                lesson_id: lessonKey,
                status: 'completed',
                progress: 100,
                completed_at: new Date().toISOString()
            });

            if (!saved) throw new Error('No se pudo guardar el progreso');

            setIsCompleted(true);
            onLessonCompleted?.(lessonKey);

            // Desbloqueo de gadget
            const unlockedGadget = getGadgetUnlockedByLesson(lessonKey);
            if (unlockedGadget) {
                setRewardGadget(unlockedGadget);
            }

            // Notificar evento
            window.dispatchEvent(new CustomEvent('lesson-progress-updated'));
            setShowCelebration(true);
        } catch (error) {
            console.error('Error guardando progreso:', error);
            setShowBanner(true);
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handleNavigateNext = () => {
        if (nextLesson && !isNextAnExam) {
            setCurrentCourseId(nextLesson.courseSlug);
            setCurrentModuleId(nextLesson.moduleId);
            setCurrentLessonId(nextLesson.shortId);
        }
    };

    const handleNavigatePrev = () => {
        if (prevLesson) {
            setCurrentCourseId(prevLesson.courseSlug);
            setCurrentModuleId(prevLesson.moduleId);
            setCurrentLessonId(prevLesson.shortId);
        }
    };

    // Tracking analítico
    useEffect(() => {
        if (!user?.id || !lessonKey) return;
        if (!hasTrackedInitialTabRef.current) {
            hasTrackedInitialTabRef.current = true;
            return;
        }
        void saveContentEvent({
            userId: user.id,
            lessonId: lessonKey,
            eventType: 'tab_change',
            eventValue: TABS.findIndex((tab) => tab.id === activeTab) + 1,
            payload: { tab_id: activeTab }
        });
    }, [activeTab, lessonKey, user?.id]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className={`lesson-modal-backdrop animate-fade-in${isMaximized ? ' lesson-modal-maximized-backdrop' : ''}`} onClick={isMaximized ? undefined : onClose}>
            <div 
                className={`lesson-modal-dialog glass-panel${isMaximized ? ' lesson-modal-dialog--maximized' : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{ '--subject-color': subject.color || '#38bdf8' }}
            >
                {/* Cabecera Premium del Visor Modal */}
                <div className="lesson-modal-top-section">
                    <div className="lesson-modal-header">
                        <div className="lesson-modal-header-left">
                            <div 
                                className="lesson-modal-icon-emblem"
                                style={{
                                    background: `radial-gradient(circle at top left, ${subject.color}25 0%, var(--surface-card) 100%)`,
                                    borderColor: `${subject.color}60`,
                                    color: subject.color,
                                    boxShadow: `0 4px 18px ${subject.color}30`
                                }}
                            >
                                {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 24 }) : <BookOpen size={24} />}
                            </div>
                            <div className="lesson-modal-title-wrap">
                                <div className="lesson-modal-meta-row">
                                    <span 
                                        className="lesson-modal-course-badge"
                                        style={{ 
                                            color: subject.color, 
                                            background: `${subject.color}15`, 
                                            borderColor: `${subject.color}35`,
                                            boxShadow: `0 1px 4px ${subject.color}15`
                                        }}
                                    >
                                        <span className="badge-glow-dot" style={{ background: subject.color }} />
                                        {subject.name}
                                    </span>
                                    <span className="lesson-modal-mod-tag">
                                        {moduleInfo.name}
                                    </span>
                                </div>
                                <h2 className="lesson-modal-title">
                                    {lesson?.title || 'Cargando Lección...'}
                                </h2>
                            </div>
                        </div>

                        <div className="lesson-modal-header-right">
                            <button
                                className="lesson-modal-maximize-btn"
                                onClick={() => setIsMaximized(v => !v)}
                                title={isMaximized ? 'Restaurar tamaño (F11)' : 'Maximizar modal'}
                                aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
                            >
                                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button 
                                className="lesson-modal-close-btn" 
                                onClick={onClose}
                                title="Cerrar visor (Escape)"
                                aria-label="Cerrar"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Barra de Pestañas Segmentadas Estilo Pill */}
                    <div className="lesson-modal-tabs-wrapper">
                        <nav className="lesson-modal-tabs-segment" style={{ '--total-tabs': activeTabs.length }}>
                            {activeTabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        className={`lesson-modal-segmented-tab ${isActive ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={isActive ? {
                                            '--tab-color': subject.color,
                                            boxShadow: `0 3px 12px ${subject.color}25`
                                        } : {}}
                                    >
                                        <span className="tab-icon">{tab.icon}</span>
                                        <span className="tab-label">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Contenido con Scroll Independiente */}
                <div className="lesson-modal-body" ref={modalContentRef}>
                    {loading ? (
                        <div className="lesson-modal-loading-state">
                            <div className="loading-spinner" style={{ borderColor: subject.color, borderTopColor: 'transparent' }} />
                            <p>Cargando laboratorio y contenido interactivo...</p>
                        </div>
                    ) : isLockedByVisibility ? (
                        <div className="lesson-modal-locked-state">
                            <Lock size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                            <h3>Lección Bloqueada</h3>
                            <p>Esta lección aún no ha sido habilitada por el docente.</p>
                        </div>
                    ) : (
                        <article className="content-body">
                            <LessonRenderer
                                blocks={tabBlocks}
                                context={{
                                    lesson,
                                    lessonId: currentLessonId,
                                    lessonKey,
                                    moduleId: currentModuleId,
                                    subject,
                                    user,
                                    activeChallenge,
                                    setActiveChallenge,
                                    showSimulator,
                                    setShowSimulator,
                                    onBackToContent: () => setActiveTab('contenido')
                                }}
                            />
                        </article>
                    )}
                </div>

                {/* Footer Fijo de Navegación de Lecciones en la Base del Modal */}
                {!loading && !isLockedByVisibility && (
                    <div className="lesson-modal-bottom-bar">
                        <div className="lesson-modal-bottom-left">
                            {!isStartOfModule && prevLesson ? (
                                <button
                                    className="nav-btn nav-btn-prev"
                                    onClick={handleNavigatePrev}
                                >
                                    <ArrowLeft size={16} />
                                    <span>Lección anterior</span>
                                </button>
                            ) : null}
                        </div>

                        <div className="lesson-modal-bottom-center">
                            {isCompleted ? (
                                <div className="lesson-bottom-completed-pill">
                                    <div className="badge-check-icon">
                                        <Check size={13} strokeWidth={3.5} />
                                    </div>
                                    <span>Completada</span>
                                </div>
                            ) : (
                                (isStaff || (typeof lessonProgress?.score === 'number' && lessonProgress.score >= 80)) ? (
                                    <button
                                        className="nav-btn-complete"
                                        style={{
                                            background: `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}dd 100%)`,
                                            boxShadow: `0 4px 16px ${subject.color}45`
                                        }}
                                        onClick={handleCompleteLesson}
                                        disabled={isSavingProgress}
                                    >
                                        <Sparkles size={16} />
                                        <span>{isSavingProgress ? 'Guardando...' : 'Marcar como Completada'}</span>
                                    </button>
                                ) : null
                            )}
                        </div>

                        <div className="lesson-modal-bottom-right">
                            {nextLesson && (
                                isNextAnExam ? (
                                    <div className="nav-btn-exam-locked" title="Examen evaluativo oficial">
                                        <Lock size={15} />
                                        <span>Examen en módulo de Evaluaciones</span>
                                    </div>
                                ) : (
                                    <button
                                        className="nav-btn nav-btn-next"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                                        }}
                                        onClick={handleNavigateNext}
                                    >
                                        <span>Siguiente lección</span>
                                        <ChevronRight size={16} />
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Puente Legacy para Simuladores SVG / WebGL */}
                <LessonLegacyBridge
                    hasSimulator={lesson?.hasSimulator}
                    onShowGuide={() => setShowGuide(true)}
                    onShowArduinoParts={() => setShowArduinoParts(true)}
                />

                {/* Modales Auxiliares de Lección */}
                {showArduinoParts && <ArduinoPartsModal open={showArduinoParts} onClose={() => setShowArduinoParts(false)} />}
                {showGuide && <GuideModal open={showGuide} guide={lesson?.guide} onClose={() => setShowGuide(false)} />}
                {showCelebration && <Celebration onClose={() => setShowCelebration(false)} />}
                {showBanner && <RewardBanner message="¡Progreso guardado con éxito!" onClose={() => setShowBanner(false)} />}
                {rewardGadget && <RewardDialog gadget={rewardGadget} onClose={() => setRewardGadget(null)} />}
            </div>
        </div>,
        document.body
    );
};

export default LessonModalViewer;
