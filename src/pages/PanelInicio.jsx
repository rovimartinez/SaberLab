import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    Calendar, AlarmClock, BookOpen, Clock, Target, ArrowRight,
    Zap, Bot, GraduationCap, Gamepad2, Award, User, Activity, TrendingUp, 
    Flame, CheckCircle2, AlertCircle, Loader2, Trophy, Sparkles, Shield, ChevronRight, Compass, Eye, EyeOff, CheckCircle, Check, X, Lock, Gift, Wrench, Hash, FileCheck,
    Sun, Moon, Monitor, ExternalLink, ChevronDown, ChevronUp, Play, LogOut, Settings, Bell, Folder, Users, Radio, Link2, ClipboardList, Cpu, Edit3, UserCheck
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useApps } from '../context/useApps';
import { api } from '../lib/api';
import { COURSES_DEFINITION, getLessonInfo, getCourseColor } from '../data/coursesData.jsx';
import { ranks, getRankByLessons, getNextRank, getRankProgress } from '../data/ranksData';
import { gadgets } from '../data/gadgetsData';
import { applyTheme, getInitialTheme } from '../lib/themeManager';
import RanksModal from '../components/dashboard/modals/RanksModal';
import DashboardAppModal from '../components/dashboard/modals/DashboardAppModal';
import PanelSimiHub from './PanelSimiHub';
import '../styles/PanelInicio.css';

// Caché en memoria para carga instantánea al volver a Inicio (0 ms)
let memoryLessonsMap = null;
let memoryAttemptsMap = null;

const WIDGETS_CATALOG = [
    { id: 'calculadora', name: 'Calculadora Científica', desc: 'Cálculos de circuitos, voltajes y potencias.', icon: '🧮', color: '#0ea5e9' },
    { id: 'ruleta', name: 'Ruleta de Aula', desc: 'Sorteador aleatorio de alumnos y preguntas en vivo.', icon: '🎡', color: '#ec4899' },
    { id: 'pizarra', name: 'Pizarra Mágica', desc: 'Lienzo interactivo para trazar diagramas y esquemas.', icon: '🎨', color: '#a855f7' },
    { id: 'semaforo', name: 'Semáforo de Tiempo', desc: 'Control visual de tiempos para actividades y retos.', icon: '🚦', color: '#f59e0b' },
    { id: 'ley-ohm', name: 'Ley de Ohm y Watt', desc: 'Despeje interactivo V = I · R y cálculo de Watts.', icon: '⚡', color: '#10b981' },
    { id: 'conversor', name: 'Conversor de Unidades', desc: 'Conversión inmediata entre prefijos métricos.', icon: '🔄', color: '#6366f1' },
    { id: 'reloj', name: 'Cronómetro & Reloj', desc: 'Temporizador preciso para pruebas prácticas.', icon: '⏱️', color: '#3b82f6' },
    { id: 'arduino', name: 'Arduino IDE Virtual', desc: 'Editor de código y lógica para robótica.', icon: '🤖', color: '#14b8a6' },
];

const getCourseIcon = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr || c.id === abbr);
    if (def?.icon) return def.icon;
    if (abbr === 'RE' || abbr === 'robotica') return <Bot size={22} />;
    if (abbr === 'EE' || abbr === 'electricidad') return <Zap size={22} />;
    return <GraduationCap size={22} />;
};

const PanelInicio = () => {
    const { 
        user, profile, enrolledCourses, userProgress: cachedProgress, refreshUserProgress, 
        lessonVisibility, signOut, isImpersonating, setViewMode, toggleViewMode,
        pendingAccessRequestsCount, unreadNotificationsCount, refreshEnrolledCourses,
        isManageModeActive, setIsManageModeActive, isStaff, refreshLessonVisibility
    } = useAuth();
    const { openLauncher } = useApps();
    const navigate = useNavigate();
    
    const getCachedStorage = (key, fallback = {}) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch {
            return fallback;
        }
    };

    const [userProgress, setUserProgress] = useState(cachedProgress);
    const [completedLessonsMap, setCompletedLessonsMap] = useState(() => memoryLessonsMap || getCachedStorage('saberlab_cached_lmap', {}));
    const [completedAttemptsMap, setCompletedAttemptsMap] = useState(() => memoryAttemptsMap || getCachedStorage('saberlab_cached_amap', {}));
    const [showRanksModal, setShowRanksModal] = useState(false);
    const [activeAppModal, setActiveAppModal] = useState(null);
    const [selectedModalCourse, setSelectedModalCourse] = useState(null);
    const [modalCourseFilter, setModalCourseFilter] = useState('all');
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const appParam = searchParams.get('app');
        if (appParam) {
            setActiveAppModal(appParam);
            setSearchParams(prev => {
                const n = new URLSearchParams(prev);
                n.delete('app');
                return n;
            }, { replace: true });
        }
    }, [searchParams]);
    const [selectedCourseId, setSelectedCourseId] = useState(() => {
        return localStorage.getItem('saberlab_active_course') || 'all';
    });
    const [expandedModules, setExpandedModules] = useState({});
    const toggleModuleExpand = (modId) => {
        setExpandedModules(prev => (prev[modId] ? {} : { [modId]: true }));
    };
    const [activeTheme, setActiveTheme] = useState(() => getInitialTheme());
    const [loading, setLoading] = useState(!cachedProgress);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const userMenuRef = useRef(null);
    const dropdownRef = useRef(null);

    // Mapa de visibilidad de Apps del Dashboard (3 estados: 'unlocked' | 'locked' | 'hidden')
    // Persistido centralmente en Cloudflare D1 (tabla visibilidad_curso, fila course_id = 0)
    const serverAppVis = (lessonVisibility && (lessonVisibility[0] || lessonVisibility['0'])) || null;

    const [appVisibilityMap, setAppVisibilityMap] = useState(() => {
        const cachedVis = getCachedStorage('saberlab_cached_visibility', {});
        const cachedServerAppVis = cachedVis[0] || cachedVis['0'];
        if (cachedServerAppVis && Object.keys(cachedServerAppVis).length > 0) {
            return {
                certificates: 'hidden',
                ...cachedServerAppVis
            };
        }
        const saved = localStorage.getItem('saberlab_app_visibility_map');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                return {
                    certificates: 'hidden',
                    ...parsed
                };
            } catch (e) { }
        }
        return {
            activities: 'locked',
            grades: 'locked',
            components: 'locked',
            rewards: 'hidden',
            certificates: 'hidden'
        };
    });

    // Sincronización en vivo con Cloudflare D1 y migración automática
    useEffect(() => {
        if (serverAppVis && Object.keys(serverAppVis).length > 0) {
            const merged = {
                certificates: 'hidden',
                ...serverAppVis
            };
            setAppVisibilityMap(merged);
            localStorage.setItem('saberlab_app_visibility_map', JSON.stringify(merged));

            // Si al servidor le faltaba certificates, actualizarlo de inmediato en D1
            if (isStaff && !serverAppVis.certificates) {
                api('/visibility', {
                    method: 'POST',
                    body: { course_id: 0, lecciones: merged }
                }).then(() => {
                    if (refreshLessonVisibility) refreshLessonVisibility();
                }).catch(err => {
                    console.error('Error auto-sincronizando certificates en D1:', err);
                });
            }
        } else if (isStaff) {
            // Si D1 aún no tiene fila 0 pero el docente tiene una configuración en local o por defecto,
            // persistirla de inmediato en la base de datos para que todos los alumnos la hereden
            const localSaved = localStorage.getItem('saberlab_app_visibility_map');
            let toSync = null;
            if (localSaved) {
                try { toSync = JSON.parse(localSaved); } catch (e) {}
            }
            if (!toSync || Object.keys(toSync).length === 0) {
                toSync = {
                    activities: 'locked',
                    grades: 'locked',
                    components: 'locked',
                    rewards: 'hidden',
                    certificates: 'hidden'
                };
            } else {
                toSync = {
                    certificates: 'hidden',
                    ...toSync
                };
            }
            api('/visibility', {
                method: 'POST',
                body: { course_id: 0, lecciones: toSync }
            }).then(() => {
                if (refreshLessonVisibility) refreshLessonVisibility();
            }).catch(err => {
                console.error('Error auto-sincronizando visibilidad de apps en D1:', err);
            });
        }
    }, [serverAppVis, isStaff, refreshLessonVisibility]);

    const cycleAppVisibility = async (appId, e) => {
        e?.stopPropagation();
        const current = appVisibilityMap[appId] || (['rewards', 'certificates'].includes(appId) ? 'hidden' : ['activities', 'grades', 'components'].includes(appId) ? 'locked' : 'unlocked');
        const nextState = current === 'unlocked' ? 'locked' : current === 'locked' ? 'hidden' : 'unlocked';
        const next = { ...appVisibilityMap, [appId]: nextState };
        
        // 1. Optimistic UI inmediato
        setAppVisibilityMap(next);
        localStorage.setItem('saberlab_app_visibility_map', JSON.stringify(next));

        // 2. Persistencia en Cloudflare D1 para toda la plataforma
        try {
            await api('/visibility', {
                method: 'POST',
                body: { course_id: 0, lecciones: next }
            });
            if (refreshLessonVisibility) {
                refreshLessonVisibility();
            }
        } catch (err) {
            console.error('Error sincronizando visibilidad de app con el servidor D1:', err);
        }
    };

    // Estados para unirse a grupo de curso
    const [joinGroupCode, setJoinGroupCode] = useState('');
    const [isJoiningGroup, setIsJoiningGroup] = useState(false);
    const [joinGroupSuccess, setJoinGroupSuccess] = useState(null);
    const [joinGroupError, setJoinGroupError] = useState(null);

    const handleJoinGroupSubmit = async (e) => {
        e.preventDefault();
        if (!joinGroupCode.trim() || isJoiningGroup) return;

        setIsJoiningGroup(true);
        setJoinGroupError(null);
        setJoinGroupSuccess(null);

        try {
            const { data, error } = await api('/enrollments/code', {
                method: 'POST',
                body: { code: joinGroupCode.trim().toUpperCase() }
            });

            if (error || !data?.curso) {
                throw new Error(error?.message || 'Código de grupo inválido o no encontrado.');
            }

            const cursoName = data.curso.name || data.curso.title || 'Curso';
            const grupoName = data.grupo?.name ? ` (Grupo: ${data.grupo.name})` : '';

            setJoinGroupSuccess(`¡Te has inscrito exitosamente en ${cursoName}${grupoName}!`);
            setJoinGroupCode('');

            if (refreshEnrolledCourses) {
                await refreshEnrolledCourses();
            }
        } catch (err) {
            console.error('Error al unirse al grupo:', err);
            setJoinGroupError(err.message || 'Código inválido o error al inscribirse.');
        } finally {
            setIsJoiningGroup(false);
        }
    };

    const handleThemeSelect = (t) => {
        const isUserAdminRole = profile?.role === 'admin' || profile?.real_role === 'admin';
        if (!isUserAdminRole && (t === 'dark' || t === 'system')) {
            setActiveTheme('light');
            applyTheme('light');
            return;
        }
        setActiveTheme(t);
        applyTheme(t);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                userMenuRef.current && 
                !userMenuRef.current.contains(e.target) &&
                (!dropdownRef.current || !dropdownRef.current.contains(e.target))
            ) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setActiveAppModal(null);
                setShowRanksModal(false);
                setIsUserMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const userMetadata = user?.user_metadata || {};
    const fullName = profile?.full_name?.split(' ')[0] || userMetadata.full_name?.split(' ')[0] || userMetadata.name?.split(' ')[0] || 'Estudiante';
    const displayName = profile?.full_name || userMetadata.full_name || userMetadata.name || fullName;
    const avatarUrl = userMetadata.avatar_url || userMetadata.picture || profile?.avatar_url || user?.photoURL || '';
    const roleText = isImpersonating 
        ? 'Vista Estudiante' 
        : (profile?.role === 'admin' 
            ? 'Admin' 
            : (['leader', 'lider', 'semillero_leader'].includes(profile?.role)
                ? 'Líder Semillero'
                : (profile?.role === 'teacher' || profile?.role === 'profesor' || profile?.role === 'docente' 
                    ? 'Docente' 
                    : 'Estudiante')));

    useEffect(() => {
        if (cachedProgress) {
            setUserProgress(cachedProgress);
        }
    }, [cachedProgress]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            if (!cachedProgress) {
                const freshProg = await refreshUserProgress();
                if (freshProg) setUserProgress(freshProg);
            } else {
                setUserProgress(cachedProgress);
            }

            try {
                const [progRes, attRes] = await Promise.allSettled([
                    api('/lesson-progress'),
                    api('/attempts')
                ]);

                const lMap = {};
                if (progRes.status === 'fulfilled' && Array.isArray(progRes.value?.data)) {
                    progRes.value.data.forEach(item => {
                        if (item.status === 'completed' || item.progress === 100) {
                            lMap[item.lesson_id] = true;
                        }
                    });
                }

                const aMap = {};
                if (attRes.status === 'fulfilled' && Array.isArray(attRes.value?.data)) {
                    attRes.value.data.forEach(att => {
                        if (att.completed_at && att.evaluation_key) {
                            aMap[att.evaluation_key.toLowerCase()] = att;
                            lMap[att.evaluation_key.toLowerCase()] = true;
                        }
                    });
                }

                ['ee-m1-l6e', 'ee-m2-eval', 'ee-m3-eval', 'ee-m4-eval'].forEach(key => {
                    const localData = localStorage.getItem(`exam_completed_${key}`);
                    if (localData) {
                        try {
                            const parsed = JSON.parse(localData);
                            aMap[key] = parsed;
                        } catch (e) {
                            aMap[key] = { points_obtained: 150 };
                        }
                    }
                });

                setCompletedLessonsMap(lMap);
                setCompletedAttemptsMap(aMap);
                memoryLessonsMap = lMap;
                memoryAttemptsMap = aMap;
                localStorage.setItem('saberlab_cached_lmap', JSON.stringify(lMap));
                localStorage.setItem('saberlab_cached_amap', JSON.stringify(aMap));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }

            setLoading(false);
        };

        fetchDashboardData();

        const handleProgressUpdated = () => {
            fetchDashboardData();
        };
        window.addEventListener('lesson-progress-updated', handleProgressUpdated);
        return () => window.removeEventListener('lesson-progress-updated', handleProgressUpdated);
    }, [user?.id]);

    const completedLessonsCount = Object.keys(completedLessonsMap).length;
    const lessonsCompleted = Math.max(userProgress?.lessons_completed || 0, completedLessonsCount);
    const streakDays = userProgress?.streak_days || (lessonsCompleted > 0 ? 1 : 0);
    
    // Rango y progresión STEAM
    const rank = getRankByLessons(lessonsCompleted);
    const nextRank = getNextRank(lessonsCompleted);
    const rankProgress = getRankProgress(lessonsCompleted);

    // Mapeo del curso activo y cursos disponibles
    const hasEnrolledCourses = (enrolledCourses && enrolledCourses.length > 0) || profile?.real_role === 'admin' || profile?.role === 'admin';
    const availableCourses = (enrolledCourses && enrolledCourses.length > 0)
        ? enrolledCourses.map(c => COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr || d.id === c.slug) || c)
        : (profile?.real_role === 'admin' || profile?.role === 'admin' ? COURSES_DEFINITION : []);

    const activeCourseDef = (selectedCourseId && selectedCourseId !== 'all'
        ? (availableCourses.find(c => String(c.id) === String(selectedCourseId) || c.abbr === selectedCourseId || c.slug === selectedCourseId) ||
           COURSES_DEFINITION.find(c => String(c.id) === String(selectedCourseId) || c.abbr === selectedCourseId || c.slug === selectedCourseId))
        : null) || availableCourses[0] || (hasEnrolledCourses ? COURSES_DEFINITION[0] : null);

    const mainCourseDef = activeCourseDef;

    const courseColor = mainCourseDef?.color || '#38bdf8';
    const courseIcon = mainCourseDef?.icon || <Zap size={22} />;
    const courseModules = mainCourseDef?.modules || [];
    const allCourseLessons = courseModules.flatMap(m => (m.lessons || []).map(l => ({ ...l, moduleId: m.id, moduleName: m.name })));
    const totalLessons = hasEnrolledCourses ? (allCourseLessons.length || 16) : 0;

    const courseCompletedCount = allCourseLessons.filter(l => 
        completedLessonsMap[l.id] || 
        completedLessonsMap[l.id.toLowerCase()] || 
        completedLessonsMap[`ee-${l.moduleId}-${l.id}`]
    ).length;

    const courseProgressPercent = totalLessons > 0 ? Math.round((courseCompletedCount / totalLessons) * 100) : 0;

    let nextLessonTarget = null;
    let lastCompletedLesson = null;

    for (const l of allCourseLessons) {
        const isDone = completedLessonsMap[l.id] || completedLessonsMap[l.id.toLowerCase()] || completedLessonsMap[`ee-${l.moduleId}-${l.id}`];
        const lessonInfo = getLessonInfo(l.id);
        if (isDone) {
            lastCompletedLesson = { ...l, title: lessonInfo?.title || l.id };
        } else if (!nextLessonTarget) {
            nextLessonTarget = { ...l, title: lessonInfo?.title || l.id };
        }
    }

    if (!nextLessonTarget && allCourseLessons.length > 0) {
        nextLessonTarget = allCourseLessons[0];
    }

    const nextLessonIsExam = nextLessonTarget?.id === 'ee-m1-l6' || nextLessonTarget?.id.endsWith('-l6') || nextLessonTarget?.id.endsWith('-l10') || nextLessonTarget?.id.endsWith('-l14') || nextLessonTarget?.id.endsWith('-l16');
    const nextLessonLink = nextLessonIsExam
        ? `/dashboard/evaluations/${nextLessonTarget.id}`
        : `/dashboard/my-courses/${mainCourseDef.slug || 'electricidad-y-electronica'}/${nextLessonTarget?.moduleId || 'm1'}/${nextLessonTarget?.id || 'ee-m1-l1'}`;

    // Actividad semanal real (0h para nuevos estudiantes)
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const todayIndex = new Date().getDay(); // 0=Dom, 1=Lun
    const weeklyHoursArr = userProgress?.weekly_hours || [0, 0, 0, 0, 0, 0, 0];
    const weeklyActivity = days.map((day, idx) => ({
        day,
        hours: weeklyHoursArr[idx] || 0,
        isToday: idx === (todayIndex === 0 ? 6 : todayIndex - 1)
    }));
    const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 1);
    const totalWeeklyHours = weeklyActivity.reduce((acc, d) => acc + d.hours, 0);
    const weeklyGoalHours = 5;
    const weeklyGoalPercent = Math.min(100, Math.round((totalWeeklyHours / weeklyGoalHours) * 100));

    // Telemetría práctica vs teoría real
    const practiceMins = userProgress?.practice_minutes || (lessonsCompleted * 20) || 0;
    const theoryMins = userProgress?.theory_minutes || (lessonsCompleted * 10) || 0;
    const totalMins = practiceMins + theoryMins;
    const practicePercent = totalMins > 0 ? Math.round((practiceMins / totalMins) * 100) : 0;
    const theoryPercent = totalMins > 0 ? (100 - practicePercent) : 0;

    const formatMins = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m < 10 ? '0' : ''}${m}m`;
    };

    // Próximas actividades dinámicas (filtradas según el curso activo de navegación)
    const upcomingActivities = [];
    const coursesToScan = (selectedCourseId !== 'all' && mainCourseDef) 
        ? [mainCourseDef] 
        : availableCourses;

    coursesToScan.forEach(c => {
        const def = COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr || d.id === c.slug) || c;
        const courseIdKey = def.id || c.id;
        const courseVis = (lessonVisibility && (lessonVisibility[courseIdKey] || lessonVisibility[String(courseIdKey)] || lessonVisibility[def.abbr])) || {};

        if (def.modules) {
            def.modules.forEach((m, idx) => {
                if (m.evaluation) {
                    const evalKey = m.evaluation.id || (idx === 0 ? 'ee-m1-l6' : `ee-m${idx + 1}-l${idx === 1 ? 10 : (idx === 2 ? 14 : 16)}`);
                    const isDone = !!(completedAttemptsMap[evalKey] || completedAttemptsMap[evalKey.toLowerCase()]);
                    const attempt = completedAttemptsMap[evalKey] || completedAttemptsMap[evalKey.toLowerCase()];
                    const pointsEarned = attempt ? (attempt.points_obtained ?? attempt.totalPts ?? attempt.score ?? m.evaluation.points) : m.evaluation.points;

                    // Un examen está bloqueado si el docente lo ocultó (false) o si es de un módulo futuro que no se ha habilitado explícitamente
                    const isExplicitlyLocked = courseVis[evalKey] === false || courseVis[evalKey.toLowerCase()] === false;
                    const isExplicitlyUnlocked = courseVis[evalKey] === true || courseVis[evalKey.toLowerCase()] === true;
                    // Si el docente lo bloqueó O si es un módulo futuro no habilitado
                    const isLocked = isExplicitlyLocked || (idx > 0 && !isExplicitlyUnlocked);

                    upcomingActivities.push({
                        id: `${def.id || def.slug}-${m.id}`,
                        evalKey,
                        title: m.evaluation.title,
                        courseId: def.id || c.id,
                        courseAbbr: def.abbr || 'STEAM',
                        course: def.name,
                        courseColor: def.color || getCourseColor(def.id) || '#38bdf8',
                        date: m.evaluation.date,
                        points: m.evaluation.points,
                        pointsEarned,
                        isDone,
                        isLocked,
                        type: 'Examen Oficial'
                    });
                }
            });
        }
    });

    // Agrupación de actividades por curso para los modales
    const courseGroups = [];
    coursesToScan.forEach(c => {
        const def = COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr || d.id === c.slug) || c;
        const cId = def.id || c.id;
        const items = upcomingActivities.filter(a => String(a.courseId) === String(cId) || a.course === def.name || a.courseAbbr === def.abbr);
        if (items.length > 0) {
            const doneCount = items.filter(a => a.isDone).length;
            const totalPoints = items.reduce((acc, a) => acc + (a.isDone ? a.pointsEarned : 0), 0);
            const maxPoints = items.reduce((acc, a) => acc + a.points, 0);
            courseGroups.push({
                courseId: cId,
                courseName: def.name,
                courseAbbr: def.abbr || 'STEAM',
                courseColor: def.color || getCourseColor(cId) || '#38bdf8',
                activities: items,
                doneCount,
                totalCount: items.length,
                totalPoints,
                maxPoints
            });
        }
    });

    const filteredCourseGroups = (modalCourseFilter === 'all' || (selectedCourseId !== 'all'))
        ? courseGroups
        : courseGroups.filter(g => String(g.courseId) === String(modalCourseFilter) || g.courseAbbr === modalCourseFilter);

    const isAdmin = profile?.role === 'admin' && !isImpersonating;

    // ── CATEGORÍA 2: MI PROGRESO & GAMIFICACIÓN ──
    const progresoApps = [
        { 
            id: 'profile', 
            name: 'Mi Perfil', 
            badge: 'Ajustes y Tema', 
            icon: <User size={26} />, 
            gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', 
            shadow: 'rgba(99, 102, 241, 0.35)',
            desc: 'Ajustes de cuenta, apariencia y preferencias'
        },
        { 
            id: 'ranks', 
            name: 'Nivel STEAM', 
            badge: `Nivel: ${rank.name}`, 
            icon: <Trophy size={26} />, 
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            shadow: 'rgba(245, 158, 11, 0.35)',
            desc: 'Sistema oficial de niveles y rangos STEAM',
            onClick: () => setShowRanksModal(true)
        },
        { 
            id: 'rewards', 
            name: 'Recompensas', 
            badge: `${gadgets.length} gadgets`, 
            icon: <Gift size={26} />, 
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
            shadow: 'rgba(139, 92, 246, 0.35)',
            desc: 'Instrumentos y simuladores desbloqueados'
        },
    ];

    // ── CATEGORÍA 3: HERRAMIENTAS DEL AULA ──
    const herramientasApps = [
        { 
            id: 'widgets', 
            name: 'Widgets', 
            badge: '8 Herramientas', 
            icon: <Wrench size={26} />, 
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
            shadow: 'rgba(6, 182, 212, 0.35)',
            desc: 'Herramientas interactivas de apoyo en el aula'
        },
        ...(isStaff ? [{ 
            id: 'analytics', 
            name: 'Analítica', 
            badge: 'Docente', 
            icon: <TrendingUp size={26} />, 
            gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
            shadow: 'rgba(16, 185, 129, 0.35)',
            desc: 'Cohorte docente, estadísticas y rendimiento',
            route: '/dashboard/analytics',
            onClick: () => navigate('/dashboard/analytics')
        }] : []),
        {
            id: 'notifications',
            name: 'Notificaciones',
            badge: ((unreadNotificationsCount || 0) > 0 ? `${unreadNotificationsCount} nuevas` : 'Al día'),
            icon: <Bell size={26} />,
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            shadow: 'rgba(6, 182, 212, 0.35)',
            desc: 'Centro de avisos, alertas y novedades académicas'
        },
        ...(isStaff ? [{
            id: 'access-requests',
            name: 'Solicitudes',
            badge: (pendingAccessRequestsCount || 0) > 0 ? `${pendingAccessRequestsCount} pendientes` : 'Al día',
            icon: <UserCheck size={26} />,
            gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            shadow: 'rgba(168, 85, 247, 0.35)',
            desc: 'Gestión y aprobación de nuevos accesos a SaberLab',
            route: '/dashboard/requests',
            onClick: () => navigate('/dashboard/requests')
        }] : []),
    ];

    // ── CATEGORÍA 1: ÁREA ACADÉMICA Y EVALUACIONES (ABAJO) ──
    const canAccessCertificate = isStaff || (userProgress?.total_points || 0) >= 450;
    const academicoApps = [
        {
            id: 'courses',
            name: 'Mi Curso',
            badge: mainCourseDef?.abbr || 'Activo',
            icon: <GraduationCap size={26} />,
            gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            shadow: 'rgba(2, 132, 199, 0.35)',
            desc: `Plan de estudios y módulos de ${mainCourseDef?.name || 'mi curso'}`,
            onClick: () => {
                setExpandedModules({});
                setSelectedModalCourse(mainCourseDef);
                setActiveAppModal('courses');
            }
        },
        { 
            id: 'activities', 
            name: 'Exámenes', 
            badge: `${upcomingActivities.length} oficiales`, 
            icon: <AlarmClock size={26} />, 
            gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', 
            shadow: 'rgba(244, 63, 94, 0.35)',
            desc: 'Agenda oficial de exámenes y evaluaciones del curso'
        },
        { 
            id: 'grades', 
            name: 'Calificaciones', 
            badge: 'Libreta oficial', 
            icon: <Award size={26} />, 
            gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', 
            shadow: 'rgba(236, 72, 153, 0.35)',
            desc: 'Libreta de notas y registro de evaluaciones'
        },
        {
            id: 'components',
            name: 'Componentes',
            badge: '74 Modelos 3D',
            icon: <Cpu size={26} />,
            gradient: 'linear-gradient(135deg, #00979C 0%, #008184 100%)',
            shadow: 'rgba(0, 151, 156, 0.35)',
            desc: 'Showroom interactivo 3D de hardware, actuadores y robots'
        },
        {
            id: 'resources',
            name: 'Recursos',
            badge: 'Biblioteca STEAM',
            icon: <Folder size={26} />,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            shadow: 'rgba(245, 158, 11, 0.35)',
            desc: 'Guías de laboratorio, videos, datasheets y código'
        },
        {
            id: 'certificates',
            name: 'Certificados',
            badge: canAccessCertificate ? 'Oficial STEAM' : `Requiere 450 pts`,
            icon: <FileCheck size={26} />,
            gradient: canAccessCertificate
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
            shadow: canAccessCertificate ? 'rgba(16, 185, 129, 0.35)' : 'rgba(71, 85, 105, 0.25)',
            desc: canAccessCertificate
                ? 'Diplomas y constancias de aprobación por curso'
                : 'Disponible al alcanzar 450 puntos STEAM',
            onClick: canAccessCertificate ? () => navigate('/dashboard/certificate/ee') : undefined,
            isLocked: !canAccessCertificate
        },
    ];

    // ── CATEGORÍA 4: GESTIÓN & SISTEMA (solo staff/admin) ──
    const sistemaApps = [
        ...(isStaff ? [
            {
                id: 'liveMonitor',
                name: 'En Vivo & Mensajes',
                badge: 'En Tiempo Real',
                icon: <Radio size={26} />,
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                shadow: 'rgba(16, 185, 129, 0.35)',
                desc: 'Alumnos en línea y alertas a pantalla'
            },
            {
                id: 'inviteLinks',
                name: 'Grupos y Enlaces',
                badge: 'Auto-unión',
                icon: <Link2 size={26} />,
                gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                shadow: 'rgba(2, 132, 199, 0.35)',
                desc: 'Grupos activos/inactivos y enlaces con tiempo'
            },
            {
                id: 'platformAdmin',
                name: 'Plataforma',
                badge: isAdmin ? 'Control Admin' : 'Docente',
                icon: <Shield size={26} />,
                gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                shadow: 'rgba(168, 85, 247, 0.35)',
                desc: 'Usuarios y configuración'
            },
            {
                id: 'aiEngineStatus',
                name: 'Estado de la IA',
                badge: '🟢 Online',
                icon: <Bot size={26} />,
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                shadow: 'rgba(16, 185, 129, 0.35)',
                desc: 'Telemetría de Gemini y tutores pedagógicos en vivo',
                onClick: () => {
                    setActiveAppModal('platformAdmin');
                }
            },
            {
                id: 'examsManagement',
                name: 'Exámenes',
                badge: 'Evaluaciones',
                icon: <ClipboardList size={26} />,
                gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                shadow: 'rgba(244, 63, 94, 0.35)',
                desc: 'Evaluaciones y resultados'
            }
        ] : []),
        ...(isAdmin ? [{
            id: 'settings',
            name: 'Configuración',
            badge: 'Plataforma',
            icon: <Settings size={26} />,
            gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
            shadow: 'rgba(100, 116, 139, 0.35)',
            desc: 'Ajustes de plataforma, variables y parámetros globales',
            onClick: () => navigate('/dashboard/settings')
        }] : [])
    ];

    const allApps = [...progresoApps, ...herramientasApps, ...academicoApps, ...sistemaApps];

    const renderAppTile = (app) => {
        const defaultState = (['rewards', 'certificates'].includes(app.id)) 
            ? 'hidden' 
            : (app.isLocked ? 'locked' : 'unlocked');
        const visState = appVisibilityMap[app.id] || defaultState;
        const isHidden = visState === 'hidden';
        const isTileLocked = visState === 'locked';

        // Si es estudiante y está oculta, no se muestra
        if (isHidden && !isStaff) {
            return null;
        }

        const effectiveLocked = !isStaff && isTileLocked;

        return (
            <div key={app.id} className="app-hub-tile-wrapper">
                <button
                    type="button"
                    className={`app-hub-tile ${app.isPrimary ? 'app-hub-tile-primary' : ''} ${effectiveLocked ? 'app-hub-tile-locked' : ''} ${isHidden ? 'app-hub-tile-hidden-preview' : ''}`}
                    onClick={() => {
                        if (isStaff && isManageModeActive) {
                            return;
                        }
                        if (effectiveLocked) return;
                        if (app.onClick) {
                            app.onClick();
                        } else {
                            setActiveAppModal(app.id);
                        }
                    }}
                    title={isHidden ? `[Oculto para Alumnos] ${app.name}: ${app.desc}` : isTileLocked && !isStaff ? `[Bloqueado] ${app.name}` : app.desc}
                    disabled={effectiveLocked}
                    style={effectiveLocked ? { opacity: 0.5, cursor: 'not-allowed' } : isHidden ? { opacity: 0.45 } : {}}
                >
                    <div 
                        className="app-hub-icon-box"
                        style={{
                            background: isTileLocked && !isStaff
                                ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                                : app.gradient,
                            boxShadow: `0 8px 20px ${isTileLocked && !isStaff ? 'rgba(100, 116, 139, 0.25)' : app.shadow}`,
                            position: 'relative'
                        }}
                    >
                        {app.icon}
                        {effectiveLocked && (
                            <Lock size={14} style={{ 
                                position: 'absolute', bottom: 2, right: 2, 
                                color: '#fff', opacity: 0.9,
                                background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '1px'
                            }} />
                        )}
                    </div>
                    <span className="app-hub-name">{app.name}</span>
                    {app.badge && (
                        <span className="app-hub-badge">
                            {effectiveLocked ? 'Bloqueado' : app.badge}
                        </span>
                    )}
                </button>

                {/* Botón Circular de 3 Estados (Visible / Bloqueado / Oculto) en Modo Gestión (Solo Staff/Admin) */}
                {isStaff && isManageModeActive && (
                    <button
                        type="button"
                        className={`app-tile-center-toggle-btn is-state-${visState}`}
                        onClick={(e) => cycleAppVisibility(app.id, e)}
                        title={`Estado: ${visState.toUpperCase()} — Clic para alternar (Visible / Bloqueado / Oculto)`}
                    >
                        {visState === 'unlocked' && <Eye size={14} />}
                        {visState === 'locked' && <Lock size={14} />}
                        {visState === 'hidden' && <EyeOff size={14} />}
                        <span className="app-tile-toggle-label">
                            {visState === 'unlocked' ? 'Visible' : visState === 'locked' ? 'Bloqueado' : 'Oculto'}
                        </span>
                    </button>
                )}
            </div>
        );
    };

    const renderHeaderUserPill = () => (
        <div className="hero-user-container" ref={userMenuRef}>
            <button
                type="button"
                className={`hero-user-pill ${isUserMenuOpen ? 'open' : ''}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isUserMenuOpen) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const opensUpward = spaceBelow < 280;

                        // Si el botón está en el panel lateral izquierdo (rect.left pequeño), alineamos a la izquierda del botón
                        const isLeftAligned = rect.left < 350;

                        setDropdownPos({
                            top: opensUpward ? undefined : rect.bottom + 8,
                            bottom: opensUpward ? window.innerHeight - rect.top + 8 : undefined,
                            left: isLeftAligned ? Math.max(16, rect.left) : undefined,
                            right: isLeftAligned ? undefined : Math.max(16, window.innerWidth - rect.right),
                            width: isLeftAligned ? rect.width : undefined
                        });
                    }
                    setIsUserMenuOpen(prev => !prev);
                }}
                title={`Cuenta de ${displayName}`}
            >
                <div className="hero-user-meta">
                    <span className="hero-user-name">{displayName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="hero-user-role-badge">
                            {roleText}
                        </span>
                        {availableCourses.length > 1 && (
                            <span 
                                className="hero-user-course-badge"
                                style={{ 
                                    background: selectedCourseId === 'all' ? 'rgba(56, 189, 248, 0.12)' : `${courseColor}18`,
                                    color: selectedCourseId === 'all' ? '#0284c7' : courseColor,
                                    borderColor: selectedCourseId === 'all' ? 'rgba(56, 189, 248, 0.3)' : `${courseColor}35`,
                                    cursor: selectedCourseId === 'all' ? 'pointer' : 'default'
                                }}
                                onClick={(e) => {
                                    if (selectedCourseId === 'all') {
                                        e.stopPropagation();
                                        setSelectedModalCourse(null);
                                        setActiveAppModal('courses');
                                    }
                                }}
                                title={selectedCourseId === 'all' ? 'Ver todos mis cursos' : undefined}
                            >
                                {selectedCourseId === 'all' ? 'Todos' : (mainCourseDef?.abbr || 'Curso')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="hero-user-avatar-box">
                    {avatarUrl ? (
                        <img 
                            src={avatarUrl} 
                            alt={displayName} 
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="hero-user-avatar-img"
                        />
                    ) : (
                        <User size={18} color="var(--text-heading)" />
                    )}
                </div>
            </button>

            {/* Dropdown via Portal — selector de curso activo y logout */}
            {isUserMenuOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className="hero-user-dropdown glass-panel animate-fade-in"
                    style={{ 
                        top: dropdownPos.top, 
                        bottom: dropdownPos.bottom, 
                        left: dropdownPos.left,
                        right: dropdownPos.right,
                        width: dropdownPos.width ? `${dropdownPos.width}px` : undefined,
                        maxWidth: dropdownPos.width ? `${dropdownPos.width}px` : '310px'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="hero-dropdown-course-header">
                        <span className="hero-dropdown-label">Curso Activo</span>
                        <span className="hero-dropdown-count">{availableCourses.length} {availableCourses.length === 1 ? 'curso' : 'cursos'}</span>
                    </div>

                    <div className="hero-dropdown-courses-list">
                        {availableCourses.length > 1 && (
                            <button
                                type="button"
                                className={`hero-dropdown-course-btn ${selectedCourseId === 'all' ? 'active' : ''}`}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCourseId('all');
                                    localStorage.setItem('saberlab_active_course', 'all');
                                    window.dispatchEvent(new Event('saberlab_course_changed'));
                                    setIsUserMenuOpen(false);
                                    setSelectedModalCourse(null);
                                    setActiveAppModal('courses');
                                }}
                            >
                                <div className="dropdown-course-dot" style={{ background: 'var(--brand-primary)' }} />
                                <div className="dropdown-course-info">
                                    <span className="dropdown-course-title">Todos los Cursos</span>
                                </div>
                                {selectedCourseId === 'all' && <Check size={14} className="dropdown-course-check" />}
                            </button>
                        )}

                        {availableCourses.map(course => {
                            const isSelected = String(selectedCourseId) === String(course.id) || selectedCourseId === course.abbr;
                            const cColor = course.color || getCourseColor(course.id) || '#38bdf8';
                            return (
                                <button
                                    key={course.id || course.abbr}
                                    type="button"
                                    className={`hero-dropdown-course-btn ${isSelected ? 'active' : ''}`}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newCourseVal = String(course.id || course.abbr);
                                        setSelectedCourseId(newCourseVal);
                                        localStorage.setItem('saberlab_active_course', newCourseVal);
                                        window.dispatchEvent(new Event('saberlab_course_changed'));
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <div className="dropdown-course-dot" style={{ background: cColor }} />
                                    <div className="dropdown-course-info">
                                        <span className="dropdown-course-title">{course.name}</span>
                                    </div>
                                    <span className="dropdown-course-abbr" style={{ color: cColor }}>
                                        {course.abbr}
                                    </span>
                                    {isSelected && <Check size={14} className="dropdown-course-check" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="hero-dropdown-divider" />

                    <div style={{ padding: '0.45rem' }}>
                        <button 
                            type="button"
                            className="hero-dropdown-logout-btn" 
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsUserMenuOpen(false);
                                if (signOut) signOut();
                            }}
                        >
                            <LogOut size={15} />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );

    // ── VISTA PARA ESTUDIANTES SIN CURSO O GRUPO ASIGNADO ──
    if (!hasEnrolledCourses && !isStaff) {
        return (
            <div className="dashboard-symmetric-root">
                <div className="hero-symmetric glass-panel">
                    <div className="hero-left">
                        <h1 className="hero-greeting">
                            ¡Hola, <span className="text-gradient">{fullName}</span>! 👋
                        </h1>
                        <p className="hero-subtitle">
                            Bienvenido a <strong>SaberLab</strong>. Aún no tienes cursos asignados.
                        </p>
                    </div>
                    <div className="hero-right">
                        {renderHeaderUserPill()}
                    </div>
                </div>

                <div className="glass-panel" style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    maxWidth: '620px',
                    margin: '2.5rem auto',
                    borderRadius: '24px',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
                }}>
                    <div style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 25px rgba(56, 189, 248, 0.35)'
                    }}>
                        <GraduationCap size={40} color="#fff" />
                    </div>

                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-heading)' }}>
                        Únete a tu clase oficial
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 1.75rem' }}>
                        Para acceder a tus lecciones interactivas, simuladores virtuales y exámenes, ingresa el <strong>código de invitación</strong> que te dio tu profesor.
                    </p>

                    <form onSubmit={handleJoinGroupSubmit} style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                            <input
                                type="text"
                                value={joinGroupCode}
                                onChange={(e) => setJoinGroupCode(e.target.value.toUpperCase())}
                                placeholder="Ej: RE-2026II, EE-2026II o SIMI-4889"
                                disabled={isJoiningGroup}
                                style={{
                                    width: '100%',
                                    background: 'var(--surface-input, rgba(15, 23, 42, 0.8))',
                                    border: '1px solid var(--border-default, rgba(255, 255, 255, 0.15))',
                                    borderRadius: '14px',
                                    padding: '0.9rem 1.25rem',
                                    color: 'var(--text-body)',
                                    fontSize: '1.05rem',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    letterSpacing: '1px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <button
                                type="submit"
                                disabled={isJoiningGroup || !joinGroupCode.trim()}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                    color: '#0f172a',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    padding: '0.9rem',
                                    borderRadius: '14px',
                                    border: 'none',
                                    cursor: isJoiningGroup || !joinGroupCode.trim() ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 8px 20px rgba(56, 189, 248, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: isJoiningGroup || !joinGroupCode.trim() ? 0.6 : 1
                                }}
                            >
                                {isJoiningGroup ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Inscribiendo...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Inscribirme en mi Grupo</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                        {joinGroupError && (
                            <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <AlertCircle size={16} />
                                <span>{joinGroupError}</span>
                            </div>
                        )}

                        {joinGroupSuccess && (
                            <div style={{ marginTop: '1rem', color: '#34d399', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <CheckCircle2 size={16} />
                                <span>{joinGroupSuccess}</span>
                            </div>
                        )}
                    </form>

                    <div style={{ borderTop: '1px solid var(--border-default, rgba(255,255,255,0.08))', paddingTop: '1.25rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                            ¿No tienes un código? Solicítalo directamente a tu docente encargado de la asignatura.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── VISTA EXCLUSIVA PARA EL SEMILLERO SIMI3D ──
    if (mainCourseDef?.abbr === 'SIMI') {
        return (
            <PanelSimiHub 
                headerCourseSelector={renderHeaderUserPill()} 
                isEmbedded={true} 
            />
        );
    }

    return (
        <div className="dashboard-symmetric-root">
            
            {/* ── 1. HEADER HERO (SIMÉTRICO Y PROFESIONAL) ── */}
            <div className="hero-symmetric glass-panel">
                <div className="hero-left">
                    <h1 className="hero-greeting">
                        ¡Hola, <span className="text-gradient">{fullName}</span>! 👋
                    </h1>
                    <p className="hero-subtitle">
                        {selectedCourseId === 'all' && availableCourses.length > 1 ? (
                            <>Panel de aprendizaje multidisciplinar en <strong>SaberLab</strong></>
                        ) : (
                            <>Te encuentras en el curso de <strong style={{ color: courseColor }}>{mainCourseDef?.name || 'SaberLab'}</strong></>
                        )}
                    </p>
                </div>

                <div className="hero-right">
                    {renderHeaderUserPill()}
                </div>
            </div>


            {/* ── FILA SUPERIOR: CATEGORÍAS 2 Y 3 JUNTAS EN ESE ORDEN ── */}
            <div className="apps-categories-top-row">
                {/* CATEGORÍA 1: PROGRESO Y GAMIFICACIÓN */}
                <div className="glass-panel apps-category-panel">
                    <div className="apps-category-header">
                        <div className="apps-category-title-group">
                            <span className="apps-category-num-badge badge-cat-1">1</span>
                            <div>
                                <h2 className="apps-category-title">Progreso & Gamificación</h2>
                            </div>
                        </div>
                    </div>
                    <div className="apps-hub-grid top-row-grid">
                        {progresoApps.map(renderAppTile)}
                    </div>
                </div>

                {/* CATEGORÍA 2: HERRAMIENTAS DEL AULA */}
                <div className="glass-panel apps-category-panel">
                    <div className="apps-category-header">
                        <div className="apps-category-title-group">
                            <span className="apps-category-num-badge badge-cat-2">2</span>
                            <div>
                                <h2 className="apps-category-title">Herramientas del Aula</h2>
                            </div>
                        </div>
                    </div>
                    <div className="apps-hub-grid top-row-grid">
                        {herramientasApps.map(renderAppTile)}
                    </div>
                </div>
            </div>

            {/* ── FILA INFERIOR: CATEGORÍA 1 (ÁREA ACADÉMICA Y EVALUACIONES) ── */}
            <div className="glass-panel apps-category-panel category-academico-panel">
                <div className="apps-category-header">
                    <div className="apps-category-title-group">
                        <span className="apps-category-num-badge badge-cat-3">3</span>
                        <div>
                            <h2 className="apps-category-title">Área Académica & Evaluaciones</h2>
                        </div>
                    </div>
                </div>
                <div className="apps-hub-grid bottom-row-grid">
                    {academicoApps.map(renderAppTile)}
                </div>
            </div>

            {/* ── FILA INFERIOR: CATEGORÍA 4 (GESTIÓN & SISTEMA — solo staff/admin) ── */}
            {sistemaApps.length > 0 && (
            <div className="glass-panel apps-category-panel category-sistema-panel">
                <div className="apps-category-header">
                    <div className="apps-category-title-group">
                        <span className="apps-category-num-badge badge-cat-4">4</span>
                        <div>
                            <h2 className="apps-category-title">Gestión & Sistema</h2>
                        </div>
                    </div>

                    {/* Botón de Gestión de Visibilidad para Docentes/Admin (Solo Icono) */}
                    <button
                        type="button"
                        className={`category-manage-toggle-btn ${isManageModeActive ? 'active' : ''}`}
                        onClick={() => setIsManageModeActive(!isManageModeActive)}
                        title={isManageModeActive ? "Finalizar gestión de visibilidad" : "Gestionar visibilidad (Mostrar / Bloquear / Ocultar)"}
                        aria-label="Gestionar visibilidad"
                    >
                        {isManageModeActive ? (
                            <Check size={16} className="manage-toggle-icon" />
                        ) : (
                            <Edit3 size={16} className="manage-toggle-icon" />
                        )}
                        {isManageModeActive && <span className="manage-toggle-pulse-dot" />}
                    </button>
                </div>
                <div className="apps-hub-grid bottom-row-grid">
                    {sistemaApps.map(renderAppTile)}
                </div>
            </div>
            )}

            {/* ── 4. MODAL / VENTANITA: SISTEMA DE RANGOS STEAM (MODULAR) ── */}
            <RanksModal
                isOpen={showRanksModal}
                onClose={() => setShowRanksModal(false)}
                rank={rank}
                lessonsCompleted={lessonsCompleted}
            />

            {/* ── 5. MODAL UNIVERSAL DE APLICACIONES (MODULAR & LAZY-LOADED) ── */}
            <DashboardAppModal
                activeAppModal={activeAppModal}
                onClose={() => setActiveAppModal(null)}
                allApps={allApps}
                selectedModalCourse={selectedModalCourse}
                setSelectedModalCourse={setSelectedModalCourse}
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                availableCourses={availableCourses}
                mainCourseDef={mainCourseDef}
                lessonsCompleted={lessonsCompleted}
                completedLessonsMap={completedLessonsMap}
                lessonVisibility={lessonVisibility}
                expandedModules={expandedModules}
                toggleModuleExpand={toggleModuleExpand}
                profile={profile}
                fullName={fullName}
                user={user}
                userMetadata={userMetadata}
                isStaff={isStaff}
                streakDays={streakDays}
                rank={rank}
                activeTheme={activeTheme}
                handleThemeSelect={handleThemeSelect}
                joinGroupCode={joinGroupCode}
                setJoinGroupCode={setJoinGroupCode}
                joinGroupError={joinGroupError}
                setJoinGroupError={setJoinGroupError}
                joinGroupSuccess={joinGroupSuccess}
                setJoinGroupSuccess={setJoinGroupSuccess}
                isJoiningGroup={isJoiningGroup}
                handleJoinGroupSubmit={handleJoinGroupSubmit}
                enrolledCourses={enrolledCourses}
                totalWeeklyHours={totalWeeklyHours}
                weeklyGoalHours={weeklyGoalHours}
                weeklyGoalPercent={weeklyGoalPercent}
                weeklyActivity={weeklyActivity}
                maxHours={maxHours}
                practiceMins={practiceMins}
                practicePercent={practicePercent}
                theoryMins={theoryMins}
                theoryPercent={theoryPercent}
                formatMins={formatMins}
                courseGroups={courseGroups}
                filteredCourseGroups={filteredCourseGroups}
                modalCourseFilter={modalCourseFilter}
                setModalCourseFilter={setModalCourseFilter}
                upcomingActivities={upcomingActivities}
                getCourseIcon={getCourseIcon}
                widgetsCatalog={WIDGETS_CATALOG}
                openLauncher={openLauncher}
                gadgets={gadgets}
                navigate={navigate}
            />

        </div>
    );
};

export default PanelInicio;
