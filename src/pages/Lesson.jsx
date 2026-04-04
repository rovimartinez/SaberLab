import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Bot,
    Brain,
    CheckCircle,
    ChevronRight,
    ClipboardList,
    Rocket
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './Lesson.css';
import { l1Missions } from '../lessons/RE/m1/l1.missions';
import { l2Missions } from '../lessons/RE/m1/l2.missions';
import { l3Missions } from '../lessons/RE/m1/l3.missions';
import { l4Missions } from '../lessons/RE/m1/l4.missions';
import { COURSES_DEFINITION, getCourseByIdentifier, getFullLessonPath, getLessonContent } from '../data/coursesData.jsx';
import CourseSidebar from '../components/course/CourseSidebar';
import LessonRenderer from '../components/lesson/LessonRenderer';
import LessonLegacyBridge from '../components/lesson/legacy/LessonLegacyBridge';
import ArduinoPartsModal from '../components/lesson/modals/ArduinoPartsModal';
import GuideModal from '../components/lesson/modals/GuideModal';
import { saveContentEvent } from '../lib/learningAnalytics';
import { normalizeLessonData } from '../lib/lessonSchema';

const tabs = [
    { id: 'contenido', label: 'Contenido', icon: <BookOpen size={18} /> },
    { id: 'repaso', label: 'Repaso', icon: <Brain size={18} /> },
    { id: 'simulador', label: 'Misiones', icon: <Rocket size={18} /> },
    { id: 'prueba', label: 'Prueba', icon: <ClipboardList size={18} /> }
];

const lessonMissionsMap = {
    're-m1-l1': l1Missions,
    're-m1-l2': l2Missions,
    're-m1-l3': l3Missions,
    're-m1-l4': l4Missions
};

const Lesson = () => {
    const { user } = useAuth();
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contenido');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const [showArduinoParts, setShowArduinoParts] = useState(false);
    const [activeChallenge, setActiveChallenge] = useState(0);
    const [showSimulator, setShowSimulator] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const hasTrackedInitialTabRef = React.useRef(false);

    const courseData = getCourseByIdentifier(courseId);

    useEffect(() => {
        if (courseId && courseData && courseId !== courseData.slug) {
            navigate(`/dashboard/my-courses/${courseData.slug}/${moduleId}/${lessonId}`, { replace: true });
        }
    }, [courseData, courseId, lessonId, moduleId, navigate]);

    useEffect(() => {
        const loadLesson = async () => {
            setLoading(true);

            try {
                const courseFallback = { name: 'Robotica Educativa', color: '#a855f7', icon: <Bot />, abbr: 'RE' };
                const currentCourseData =
                    courseData ||
                    COURSES_DEFINITION.find((course) => course.slug === courseId || course.abbr.toLowerCase() === courseId.toLowerCase()) ||
                    courseFallback;

                const registryCourseId = currentCourseData ? currentCourseData.abbr.toLowerCase() : courseId.toLowerCase();
                const internalId = lessonId && lessonId.includes('-')
                    ? lessonId
                    : `${registryCourseId}-${moduleId.toLowerCase()}-${lessonId.toLowerCase()}`;

                const data = await getLessonContent(internalId);
                setLesson(data);
            } catch (error) {
                console.error('Error loading lesson:', error);
            }

            setLoading(false);
        };

        loadLesson();
    }, [courseData, courseId, lessonId, moduleId]);

    const courseCode = courseData ? courseData.abbr.toLowerCase() : courseId.toLowerCase();
    const internalId = lessonId && lessonId.includes('-')
        ? lessonId
        : `${courseCode}-${moduleId.toLowerCase()}-${lessonId.toLowerCase()}`;
    const lessonPath = getFullLessonPath(internalId);
    const moduleInfo = (lessonPath && lessonPath.module) || { name: 'Modulo 1' };
    const subject = (lessonPath && lessonPath.course) || { name: 'Robotica Educativa', color: '#a855f7', icon: <Bot />, abbr: 'RE' };
    const courseInfo = (lessonPath && lessonPath.lesson) || { title: 'Leccion' };
    const resolvedMissions = lessonMissionsMap[internalId] || [];
    const lessonKey = internalId;
    const normalizedLesson = normalizeLessonData({ lesson, lessonKey, missions: resolvedMissions });
    const tabBlocks = normalizedLesson.blocksByTab?.[activeTab] || [];

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
                            <span>Modulos del curso</span>
                        </button>
                        <button
                            className="nav-btn nav-btn-complete"
                            style={{ background: subject.color, border: 'none' }}
                        >
                            <CheckCircle size={20} />
                            <span>Marcar como completada</span>
                        </button>
                    </div>
                </article>
            </main>
        </div>
    );
};

export default Lesson;
