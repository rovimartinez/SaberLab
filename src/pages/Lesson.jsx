import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Bot,
    Brain,
    CheckCircle,
    ChevronRight,
    ClipboardList,
    Rocket,
    Lock
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import '../styles/Lesson.css';
import { l1Missions } from '../lessons/RE/m1/l1.missions';
import { l2Missions } from '../lessons/RE/m1/l2.missions';
import { l3Missions } from '../lessons/RE/m1/l3.missions';
import { l4Missions } from '../lessons/RE/m1/l4.missions';
import { COURSES_DEFINITION, getCourseByIdentifier, getFullLessonPath, getLessonContent, getNextLesson, getPreviousLesson } from '../data/coursesData.jsx';
import CourseSidebar from '../components/course/CourseSidebar';
import LessonRenderer from '../components/lesson/LessonRenderer';
import LessonLegacyBridge from '../components/lesson/legacy/LessonLegacyBridge';
import ArduinoPartsModal from '../components/lesson/modals/ArduinoPartsModal';
import GuideModal from '../components/lesson/modals/GuideModal';
import { saveContentEvent } from '../lib/learningAnalytics';
import { normalizeLessonData } from '../lib/lessonSchema';
import { fetchLessonProgress, upsertLessonProgress } from '../lib/studentProgress';
import Celebration from '../components/celebration/Celebration';
import RewardBanner from '../components/celebration/RewardBanner';
import RewardDialog from '../components/celebration/RewardDialog';
import { getGadgetUnlockedByLesson } from '../data/gadgetsData';

const tabs = [
    { id: 'contenido', label: 'Contenido', icon: <BookOpen size={18} /> },
    { id: 'repaso', label: 'Repaso', icon: <Brain size={18} /> },
    { id: 'simulador', label: 'Práctica', icon: <Rocket size={18} /> },
    { id: 'prueba', label: 'Prueba', icon: <ClipboardList size={18} /> }
];

const lessonMissionsMap = {
    're-m1-l1': l1Missions,
    're-m1-l2': l2Missions,
    're-m1-l3': l3Missions,
    're-m1-l4': l4Missions
};

const Lesson = () => {
    const { user, profile, lessonVisibility } = useAuth();
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();

    const courseData = getCourseByIdentifier(courseId);
    const courseCode = courseData ? courseData.abbr.toLowerCase() : courseId.toLowerCase();
    const courseVisibility = lessonVisibility[courseData?.id] || {};

    // Identificador único de la lección para base de datos y búsqueda
    const internalId = useMemo(() => {
        if (!lessonId) return '';
        if (lessonId.includes('-')) return lessonId.toLowerCase();
        const cleanMod = moduleId ? moduleId.toLowerCase() : 'm1';
        const cleanLes = lessonId.toLowerCase().startsWith('l') ? lessonId.toLowerCase() : `l${lessonId.toLowerCase()}`;
        return `${courseCode}-${cleanMod}-${cleanLes}`;
    }, [courseCode, moduleId, lessonId]);

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);
    const previousLesson = useMemo(() => getPreviousLesson(internalId), [internalId]);
    const [isPreviousCompleted, setIsPreviousCompleted] = useState(true);

    const isLockedByVisibility = !isStaff && courseVisibility[internalId] === false;
    const isLocked = isLockedByVisibility;

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contenido');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const [showArduinoParts, setShowArduinoParts] = useState(false);
    const [activeChallenge, setActiveChallenge] = useState(0);
    const [showSimulator, setShowSimulator] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [rewardGadget, setRewardGadget] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const hasTrackedInitialTabRef = useRef(false);

    const checkProgress = useCallback(async () => {
        if (!user?.id || !internalId) return;
        try {
            const prog = await fetchLessonProgress(user.id, internalId);
            if (prog && (prog.status === 'completed' || prog.progress === 100 || (typeof prog.score === 'number' && prog.score >= 80))) {
                setIsCompleted(true);
            } else {
                setIsCompleted(false);
            }
        } catch (err) {
            console.error('Error cargando progreso de lección:', err);
        }
    }, [user?.id, internalId]);

    useEffect(() => {
        checkProgress();
    }, [checkProgress]);

    useEffect(() => {
        const handleProgressEvent = () => {
            checkProgress();
        };
        window.addEventListener('lesson-progress-updated', handleProgressEvent);
        return () => window.removeEventListener('lesson-progress-updated', handleProgressEvent);
    }, [checkProgress]);

    useEffect(() => {
        if (internalId && (internalId === 'ee-m1-l6' || internalId.endsWith('-l6') || internalId.endsWith('-l10') || internalId.endsWith('-l14') || internalId.endsWith('-l16'))) {
            navigate(`/dashboard/evaluations/${internalId}`, { replace: true });
            return;
        }

        if (courseId && courseData && courseId !== courseData.slug) {
            navigate(`/dashboard/my-courses/${courseData.slug}/${moduleId}/${lessonId}`, { replace: true });
        }
    }, [courseData, courseId, internalId, lessonId, moduleId, navigate]);

    useEffect(() => {
        const loadLesson = async () => {
            setLoading(true);
            try {
                const data = await getLessonContent(internalId);
                setLesson(data);
            } catch (error) {
                console.error('Error loading lesson:', error);
            }

            setLoading(false);
        };

        loadLesson();
    }, [internalId]);

    const lessonPath = getFullLessonPath(internalId);
    const moduleInfo = (lessonPath && lessonPath.module) || { name: 'Modulo 1' };
    const subject = (lessonPath && lessonPath.course) || { name: 'Robotica Educativa', color: '#a855f7', icon: <Bot />, abbr: 'RE' };
    const courseInfo = (lessonPath && lessonPath.lesson) || { title: 'Leccion' };
    const resolvedMissions = lessonMissionsMap[internalId] || [];
    const lessonKey = internalId;
    const nextLesson = useMemo(() => getNextLesson(internalId), [internalId]);

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

            // Verificar si esta lección desbloquea un gadget
            const unlockedGadget = getGadgetUnlockedByLesson(lessonKey);
            if (unlockedGadget) {
                setRewardGadget(unlockedGadget);
            }

            // 🎉 Mostrar celebración con confeti
            setShowCelebration(true);
        } catch (error) {
            console.error('Error saving lesson progress:', error);
            // Banner de error sutil en vez de alert
            setShowBanner(true);
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handleCelebrationClose = () => {
        setShowCelebration(false);
        navigate(`/dashboard/my-courses/${courseId}`);
    };

    const handleNextLesson = () => {
        setShowCelebration(false);
        if (nextLesson) {
            navigate(`/dashboard/my-courses/${nextLesson.courseSlug}/${nextLesson.moduleId}/${nextLesson.shortId}`);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
            eventValue: tabs.findIndex((tab) => tab.id === activeTab) + 1,
            payload: {
                tab_id: activeTab
            }
        });
    }, [activeTab, lessonKey, user?.id]);

    if (loading) {
        return (
            <div className="lesson-view-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Cargando...</div>
                    <p>Cargando leccion...</p>
                </div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="lesson-view-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem' }}>
                <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>
                        {isLockedByPrerequisite ? 'Lección Aún No Desbloqueada' : 'Lección Bloqueada'}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                        {isLockedByPrerequisite ? (
                            <>
                                Para acceder a esta lección, primero debes aprobar la prueba de la lección anterior (<strong>{previousLesson?.title || 'Lección Anterior'}</strong>) con un puntaje mínimo del <strong>80%</strong>.
                            </>
                        ) : (
                            'Esta lección aún no ha sido habilitada por el docente para este curso. Consulta con tu profesor o regresa al panel del curso.'
                        )}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {isLockedByPrerequisite && previousLesson && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
                                onClick={() => navigate(`/dashboard/my-courses/${previousLesson.courseSlug}/${previousLesson.moduleId}/${previousLesson.shortId}`)}
                            >
                                <Brain size={16} />
                                <span>Ir a lección anterior</span>
                            </button>
                        )}
                        <button
                            className="btn"
                            style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/my-courses/${courseData?.slug || courseId}`)}
                        >
                            <ArrowLeft size={16} />
                            <span>Volver al curso</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-view-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>No encontrada</div>
                    <p>Leccion no encontrada</p>
                    <Link to="/dashboard" style={{ color: subject.color, marginTop: '1rem', display: 'inline-block' }}>Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-view-container animate-fade-in">
            {/* 🎉 Celebración al completar lección */}
            <Celebration
                show={showCelebration}
                onClose={handleCelebrationClose}
                onNextLesson={nextLesson ? handleNextLesson : null}
                nextLessonTitle={nextLesson?.title}
                title="¡Lección Completada!"
                subtitle="Tu progreso fue guardado. ¡Sigue aprendiendo!"
            />

            {/* Reward Dialog al desbloquear gadget */}
            <RewardDialog
                isOpen={!!rewardGadget && !showCelebration}
                onClose={() => setRewardGadget(null)}
                gadget={rewardGadget}
            />

            {/* Banner de error sutil */}
            <RewardBanner
                show={showBanner}
                message="Error al guardar"
                desc="No se pudo guardar el progreso. Inténtalo de nuevo."
            />

            <LessonLegacyBridge
                hasSimulator={lesson?.hasSimulator}
                onShowGuide={() => setShowGuide(true)}
                onShowArduinoParts={() => setShowArduinoParts(true)}
            />
            <GuideModal open={showGuide} onClose={() => setShowGuide(false)} />
            <ArduinoPartsModal open={showArduinoParts} onClose={() => setShowArduinoParts(false)} />

            <CourseSidebar
                subject={subject}
                currentLessonId={internalId}
                isOpen={isRightSidebarOpen}
                toggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                lessonVisibility={courseVisibility}
            />

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${scrollProgress}%`,
                    height: '3px',
                    background: `linear-gradient(to right, ${subject.color}, #ffffff)`,
                    zIndex: 2000,
                    transition: 'width 0.1s ease-out',
                    boxShadow: `0 0 10px ${subject.color}`
                }}
            />

            <header
                className="lesson-header-premium"
                style={{
                    background: `linear-gradient(90deg, ${subject.color}50 0%, #161d2b 100%)`,
                    border: `1px solid ${subject.color}40`,
                    boxShadow: `0 4px 20px ${subject.color}15`
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%) rotate(15deg)',
                        opacity: 0.4,
                        color: subject.color,
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                >
                    {React.cloneElement(subject.icon, { size: 140 })}
                </div>

                <div className="lesson-header-main" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="lesson-header-info">
                        <div className="lesson-breadcrumb">
                            <span>{subject.name}</span>
                            <ChevronRight size={12} className="breadcrumb-sep" />
                            <span>{moduleInfo.name}</span>
                            <ChevronRight size={12} className="breadcrumb-sep" />
                            <span style={{ color: subject.color }}>{lesson?.title || courseInfo.title}</span>
                        </div>
                        <h1>{lesson?.title || 'Cargando...'}</h1>
                    </div>

                    <Link to={`/dashboard/my-courses/${subject.slug}`} className="btn-back-course">
                        <ArrowLeft size={18} />
                        <span>Volver al curso</span>
                    </Link>
                </div>
            </header>

            <nav className="lesson-tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`lesson-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="active-tab-indicator" style={{ background: subject.color }} />
                        )}
                    </button>
                ))}
            </nav>

            <main className="lesson-content-card glass-panel">
                <article className="content-body">
                    <LessonRenderer
                        blocks={tabBlocks}
                        context={{
                            lesson,
                            lessonId,
                            lessonKey,
                            moduleId,
                            subject,
                            user,
                            activeChallenge,
                            setActiveChallenge,
                            showSimulator,
                            setShowSimulator,
                            onBackToContent: () => setActiveTab('contenido')
                        }}
                    />

                    <div className="lesson-nav-footer">
                        <button
                            className="nav-btn nav-btn-prev"
                            onClick={() => navigate(`/dashboard/my-courses/${courseId}`)}
                        >
                            <ArrowLeft size={20} />
                            <span>Módulos del curso</span>
                        </button>

                        {isCompleted ? (
                            <div
                                className="nav-btn nav-btn-complete"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'default',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <CheckCircle size={20} />
                                <span>¡Lección Aprobada! (≥80%) ✓</span>
                            </div>
                        ) : (
                            <button
                                className="nav-btn nav-btn-complete"
                                style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
                                }}
                                onClick={() => setActiveTab('prueba')}
                            >
                                <ClipboardList size={20} />
                                <span>Aprobar Prueba (Mínimo 80%)</span>
                            </button>
                        )}

                        {nextLesson && (
                            (isCompleted || isStaff) ? (
                                <button
                                    className="nav-btn nav-btn-next"
                                    style={{
                                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onClick={handleNextLesson}
                                >
                                    <span>Siguiente lección</span>
                                    <ChevronRight size={20} />
                                </button>
                            ) : (
                                <div
                                    title="Debes aprobar el cuestionario con un mínimo de 80% para desbloquear la siguiente lección"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '8px',
                                        background: 'rgba(51, 65, 85, 0.45)',
                                        color: '#94a3b8',
                                        border: '1px dashed rgba(148, 163, 184, 0.3)',
                                        cursor: 'not-allowed',
                                        fontSize: '0.9rem',
                                        userSelect: 'none'
                                    }}
                                >
                                    <Lock size={16} />
                                    <span>Siguiente lección (Bloqueada 80%)</span>
                                </div>
                            )
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
};

export default Lesson;
