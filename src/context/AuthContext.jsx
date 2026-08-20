import { createContext, useEffect, useState, useRef } from 'react';
import { api, setToken, clearToken } from '../lib/api';

import { COURSES_DEFINITION } from '../data/coursesData.jsx';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [viewMode, setViewModeState] = useState(() => localStorage.getItem('saberlab_view_mode') || 'admin');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [lessonVisibility, setLessonVisibility] = useState({});
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pendingAccessRequestsCount, setPendingAccessRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionRejected, setSessionRejected] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('saberlab_view_mode', mode);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'student' ? 'admin' : 'student');
  };

  // Refs for stable identity in effects
  const userRef = useRef(user);
  const profileRef = useRef(profile);

  // Sync refs
  useEffect(() => {
    userRef.current = user;
    profileRef.current = profile;
  }, [user, profile]);

  const clearPendingAccessData = () => {
    localStorage.removeItem('pending_email');
    localStorage.removeItem('pending_name');
    localStorage.removeItem('pending_status');
  };

  const storePendingAccessData = (loggedInUser, status = 'pending') => {
    const googleName =
      loggedInUser.user_metadata?.full_name ||
      loggedInUser.user_metadata?.name ||
      loggedInUser.email?.split('@')[0] ||
      'Estudiante';

    localStorage.setItem('pending_email', loggedInUser.email || '');
    localStorage.setItem('pending_name', googleName);
    localStorage.setItem('pending_status', status);
  };

  const resetAccessState = () => {
    setProfile(null);
    setEnrolledCourses([]);
    setUnreadNotificationsCount(0);
    setPendingAccessRequestsCount(0);
    setEvaluations([]);
    setNotifications([]);
    setUserProgress(null);
    setInitialDataLoaded(false);
  };

  const activateResolvedProfile = async (loggedInUser, resolvedProfile) => {
    if (!loggedInUser || !resolvedProfile) return;

    try {
        const isApproved = resolvedProfile.role === 'admin' || resolvedProfile.access_status === 'approved';
        setSessionRejected(resolvedProfile.access_status === 'rejected');
        setProfile({
          ...resolvedProfile,
          real_role: resolvedProfile.role
        });

        if (!isApproved) {
          setInitialDataLoaded(true);
          return;
        }

        clearPendingAccessData();

        // Prioridad 1: Cursos (esencial para el resto y para obtener los IDs correctos)
        const courses = await loadEnrolledCourses(loggedInUser.id, resolvedProfile.role);
        
        // Prioridad 2: Resto de datos en paralelo usando los cursos recién obtenidos
        const courseIds = resolvedProfile.role === 'admin' 
            ? [1, 2, 3, 4, 5, 6] 
            : (courses && courses.length > 0 ? courses.map(c => c.id) : []);

        await Promise.allSettled([
            loadNotifications(loggedInUser.id),
            loadEvaluations(loggedInUser.id, resolvedProfile.role),
            loadUserProgress(loggedInUser.id),
            resolvedProfile.role === 'admin' ? loadPendingAccessRequestsCount() : Promise.resolve()
        ]);

        setInitialDataLoaded(true);
    } catch (err) {
        console.error('Error in activateResolvedProfile:', err);
    }
  };

  const getAllCoursesWithProgress = () => (
    COURSES_DEFINITION.map((course) => ({
      ...course,
      progress: 0,
      lastLesson: 'Sin iniciar'
    }))
  );

  const loadEnrolledCourses = async (userId, role = 'student') => {
    if (role === 'admin') {
      const allCourses = getAllCoursesWithProgress();
      setEnrolledCourses(allCourses);
      // Cargar visibilidad para todos los cursos
      await loadLessonVisibility();
      return allCourses;
    }

    try {
      const { data, error } = await api('/profile');
      if (error) throw error;

      const courses = data?.courses || [];

      if (courses && courses.length > 0) {
        const courseIds = courses.map((course) => course.id);

        const coursesWithProgress = courseIds.map((courseId) => {
          const courseDef = COURSES_DEFINITION.find((course) => course.id === courseId);
          if (!courseDef) {
            return {
              id: courseId,
              name: 'Curso Desconocido',
              abbr: '??',
              slug: 'unknown',
              progress: 0
            };
          }

          return {
            ...courseDef,
            progress: 0,
            lastLesson: 'Sin iniciar'
          };
        });

        setEnrolledCourses(coursesWithProgress);
        
        // Cargar visibilidad de lecciones para estos cursos
        await loadLessonVisibility(courseIds);
        return coursesWithProgress;
      } else {
        setEnrolledCourses([]);
        return [];
      }
    } catch (err) {
      console.error('Error cargando cursos:', err);
      return;
    }
  };

  const loadNotifications = async (userId) => {
    try {
        const { data } = await api('/notifications');

        if (data) {
            setNotifications(data);
            setUnreadNotificationsCount(data.filter(n => !n.read).length);
        }
    } catch (err) {
        console.error('Error loading notifications:', err);
    }
  };

  const loadNotificationsCount = async (userId) => {
    try {
      const { data } = await api('/notifications');
      setUnreadNotificationsCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications count:', err);
    }
  };

  const refreshEnrolledCourses = async () => {
    if (user) {
      await loadEnrolledCourses(user.id, profile?.role);
    }
  };

  const loadLessonVisibility = async () => {
    try {
      const { data } = await api('/visibility');
      const visibility = data && typeof data === 'object' ? data : {};
      setLessonVisibility(visibility);
    } catch (err) {
      console.error('Error cargando visibilidad de lecciones:', err);
      setLessonVisibility({});
    }
  };

  const refreshNotificationsCount = async () => {
    if (user) {
      await loadNotificationsCount(user.id);
    }
  };

  const loadPendingAccessRequestsCount = async () => {
    try {
      const { data } = await api('/requests');
      setPendingAccessRequestsCount((data || []).filter(r => r.status === 'pending').length);
    } catch (err) {
      console.error('Error loading pending access requests count:', err);
    }
  };

  const refreshPendingAccessRequestsCount = async () => {
    if (profile?.role === 'admin') {
      await loadPendingAccessRequestsCount();
      return;
    }

    setPendingAccessRequestsCount(0);
  };

  const loadEvaluations = async (userId, role) => {
    try {
      const { data } = await api('/evaluations');
      if (data) setEvaluations(data);
    } catch (err) {
      console.error('Error loading evaluations:', err);
    }
  };

  const loadUserProgress = async (userId) => {
    try {
      const { data } = await api('/progress');
      if (data) {
        setUserProgress(data);
        if (data.courses_progress) {
          setEnrolledCourses(prevCourses => (prevCourses || []).map(course => {
            const courseStat = data.courses_progress[course.id];
            if (courseStat) {
              return {
                ...course,
                progress: courseStat.progress,
                completedLessons: courseStat.completed,
                totalLessons: courseStat.total,
                lessons: courseStat.total
              };
            }
            return course;
          }));
        }
      }
    } catch (err) {
      console.error('Error loading user progress:', err);
    }
  };

  const getLatestAccessRequest = async (email) => {
    if (!email) return null;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data } = await api(`/requests?email=${encodeURIComponent(normalizedEmail)}`);
      return data || null;
    } catch (err) {
      console.error('Error consultando solicitud de acceso:', err);
      return null;
    }
  };

  const validateSession = async (token) => {
    try {
      if (!token) {
        setUser(null);
        setSessionRejected(false);
        resetAccessState();
        clearPendingAccessData();
        setLoading(false);
        return;
      }

      const { data, error } = await api('/auth/me');
      if (error) throw error;

      const p = data?.profile;
      if (!p) {
        setUser(null);
        setProfile(null);
        setSessionRejected(false);
        resetAccessState();
        clearPendingAccessData();
        setLoading(false);
        return;
      }

      const loggedInUser = {
        id: p.id,
        email: p.email,
        user_metadata: {
          name: p.full_name,
          full_name: p.full_name,
          avatar_url: p.avatar_url
        }
      };

      setUser(loggedInUser);
      await activateResolvedProfile(loggedInUser, p);
    } catch (err) {
      console.error('Session validation error:', err);
      clearToken();
      setUser(null);
      setProfile(null);
      setSessionRejected(false);
      resetAccessState();
      clearPendingAccessData();
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    const initSession = async () => {
      // Si venimos de Google OAuth, el token llega en el hash.
      const rawHash = window.location.hash;
      let token = localStorage.getItem('saberlab-token');

      if (rawHash.includes('token=')) {
        const hashParams = rawHash.includes('?')
          ? rawHash.slice(rawHash.indexOf('?') + 1)
          : rawHash.replace(/^#\/?/, '');
        const params = new URLSearchParams(hashParams);
        token = params.get('token');
        if (token) {
          setToken(token);
          // Limpiar el hash para no dejar el token en la URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      await validateSession(token);
    };

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      setPendingAccessRequestsCount(0);
      return undefined;
    }

    const poll = async () => {
      await refreshPendingAccessRequestsCount();
    };

    poll();
    const interval = setInterval(poll, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role]);

  const signInWithGoogle = async () => {
    window.location.assign('/api/auth/start');
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
    setProfile(null);
    setSessionRejected(false);
    clearPendingAccessData();
    setEnrolledCourses([]);
    setUnreadNotificationsCount(0);
    setPendingAccessRequestsCount(0);
    resetAccessState();
  };

  const realRole = profile?.real_role || profile?.role || 'student';
  const isStaffUser = ['admin', 'teacher', 'docente', 'profesor'].includes(realRole);
  const isImpersonating = isStaffUser && viewMode === 'student';
  const effectiveRole = isImpersonating ? 'student' : realRole;

  const effectiveProfile = profile ? {
    ...profile,
    role: effectiveRole,
    real_role: realRole,
    isImpersonating
  } : null;

  return (
    <AuthContext.Provider value={{ 
        user, 
        profile: effectiveProfile, 
        realRole,
        viewMode,
        isStaffUser,
        isImpersonating,
        setViewMode,
        toggleViewMode,
        loading, 
        sessionRejected, 
        setSessionRejected, 
        signInWithGoogle, 
        signOut, 
        enrolledCourses, 
        lessonVisibility, 
        unreadNotificationsCount, 
        pendingAccessRequestsCount, 
        refreshNotificationsCount, 
        refreshEnrolledCourses, 
        refreshPendingAccessRequestsCount,
        evaluations,
        notifications,
        userProgress,
        initialDataLoaded,
        refreshSession: () => validateSession(localStorage.getItem('saberlab-token')),
        refreshEvaluations: () => loadEvaluations(user?.id, effectiveRole),
        refreshNotifications: () => loadNotifications(user?.id),
        refreshUserProgress: () => loadUserProgress(user?.id),
        refreshLessonVisibility: loadLessonVisibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};
