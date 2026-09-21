import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { api, setToken, clearToken } from '../lib/api';

import { COURSES_DEFINITION } from '../data/coursesData.jsx';

const getCachedJson = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCachedJson('saberlab_cached_user'));
  const [profile, setProfile] = useState(() => getCachedJson('saberlab_cached_profile'));
  const [viewMode, setViewModeState] = useState(() => localStorage.getItem('saberlab_view_mode') || 'admin');
  const [enrolledCourses, setEnrolledCourses] = useState(() => getCachedJson('saberlab_cached_courses', []));
  const [lessonVisibility, setLessonVisibility] = useState(() => getCachedJson('saberlab_cached_visibility', {}));
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pendingAccessRequestsCount, setPendingAccessRequestsCount] = useState(0);
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('saberlab-token');
    const cachedUser = getCachedJson('saberlab_cached_user');
    const cachedProfile = getCachedJson('saberlab_cached_profile');
    return !(token && cachedUser && cachedProfile);
  });
  const [sessionRejected, setSessionRejected] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProgress, setUserProgress] = useState(() => getCachedJson('saberlab_cached_progress'));
  const [totalPoints, setTotalPoints] = useState(() => {
    const localKeys = ['ee-m1-l6', 'ee-m2-l10', 'ee-m3-l14', 'ee-m4-l16'];
    let localSum = 0;
    localKeys.forEach(key => {
      try {
        const item = localStorage.getItem(`exam_completed_${key}`);
        if (item) {
          const parsed = JSON.parse(item);
          const pts = parsed.points_obtained ?? parsed.totalPts ?? parsed.score ?? 0;
          localSum += Number(pts) || 0;
        }
      } catch {}
    });
    return localSum;
  });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isManageModeActive, setIsManageModeActive] = useState(() => {
    return localStorage.getItem('saberlab_manage_mode') === 'true';
  });

  const toggleManageMode = useCallback(() => {
    setIsManageModeActive(prev => {
      const next = !prev;
      localStorage.setItem('saberlab_manage_mode', String(next));
      window.dispatchEvent(new Event('saberlab_managemode_changed'));
      return next;
    });
  }, []);

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

  // Recargar cursos y visibilidad cuando cambia el modo de vista (admin <-> estudiante)
  useEffect(() => {
    if (user && profile) {
      const realRole = profile?.real_role || profile?.role;
      const isStaffUser = ['admin', 'teacher', 'docente', 'profesor', 'leader', 'lider'].includes(realRole);
      // Para administradores o docentes que simulan vista de estudiante, mantenemos la lista de cursos disponibles
      // para que puedan explorar cualquier curso sin perder su curso activo
      loadEnrolledCourses(user.id, realRole);
    }
  }, [viewMode, user?.id]);

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
    setTotalPoints(0);
    setInitialDataLoaded(false);
    localStorage.removeItem('saberlab_cached_user');
    localStorage.removeItem('saberlab_cached_profile');
    localStorage.removeItem('saberlab_cached_courses');
    localStorage.removeItem('saberlab_cached_visibility');
    localStorage.removeItem('saberlab_cached_progress');
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

        const coursesWithProgress = courses.map((userCourse) => {
          const courseDef = COURSES_DEFINITION.find((c) => 
            c.id === userCourse.id || 
            c.id === Number(userCourse.id) ||
            (c.abbr && userCourse.abbr && c.abbr.toUpperCase() === userCourse.abbr.toUpperCase()) ||
            (c.slug && userCourse.slug && c.slug.toLowerCase() === userCourse.slug.toLowerCase()) ||
            (c.name && userCourse.name && c.name.toLowerCase() === userCourse.name.toLowerCase())
          );

          if (!courseDef) {
            return {
              id: userCourse.id,
              name: userCourse.name || 'Curso Asignado',
              abbr: userCourse.abbr || 'EE',
              slug: userCourse.slug || 'electricidad-y-electronica',
              progress: 0,
              lastLesson: 'Sin iniciar'
            };
          }

          return {
            ...courseDef,
            progress: 0,
            lastLesson: 'Sin iniciar'
          };
        });

        setEnrolledCourses(coursesWithProgress);
        localStorage.setItem('saberlab_cached_courses', JSON.stringify(coursesWithProgress));
        
        // Cargar visibilidad de lecciones para estos cursos
        await loadLessonVisibility(courseIds);
        return coursesWithProgress;
      } else {
        setEnrolledCourses([]);
        return [];
      }
    } catch (err) {
      console.error('Error cargando cursos:', err);
      return [];
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
      localStorage.setItem('saberlab_cached_visibility', JSON.stringify(visibility));
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
      const count = (data || []).filter(r => r.status === 'pending').length;
      setPendingAccessRequestsCount(prev => prev === count ? prev : count);
    } catch (err) {
      console.error('Error loading pending access requests count:', err);
    }
  };

  const refreshPendingAccessRequestsCount = async () => {
    if (profile?.role === 'admin' || profile?.real_role === 'admin') {
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

  const calculateTotalPoints = (progressData) => {
    let d1Pts = Number(progressData?.total_points) || 0;
    const localKeys = ['ee-m1-l6', 'ee-m2-l10', 'ee-m3-l14', 'ee-m4-l16'];
    let localSum = 0;
    localKeys.forEach(key => {
      try {
        const item = localStorage.getItem(`exam_completed_${key}`);
        if (item) {
          const parsed = JSON.parse(item);
          const pts = parsed.points_obtained ?? parsed.totalPts ?? parsed.score ?? 0;
          localSum += Number(pts) || 0;
        }
      } catch {}
    });
    return Math.max(d1Pts, localSum);
  };

  const loadUserProgress = async (userId) => {
    try {
      const { data } = await api('/progress');
      if (data) {
        setUserProgress(data);
        localStorage.setItem('saberlab_cached_progress', JSON.stringify(data));
        setTotalPoints(calculateTotalPoints(data));
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
        return data;
      }
    } catch (err) {
      console.error('Error loading user progress:', err);
    }
    return null;
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
      setProfile({ ...p, real_role: p.role });
      localStorage.setItem('saberlab_cached_user', JSON.stringify(loggedInUser));
      localStorage.setItem('saberlab_cached_profile', JSON.stringify(p));

      // Desbloquear pantalla de inmediato: los iconos y el dashboard se muestran ya mismo
      setLoading(false);

      // Cargar cursos y el resto de la telemetría en segundo plano sin congelar la app
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
          // Limpiar solo el hash preservando los query params (?code=...)
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }

      await validateSession(token);

      // Si hay un código de invitación pendiente y no estamos en /join, redirigir a /join para auto-inscribir
      const pendingCode = localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');
      if (pendingCode && !window.location.pathname.startsWith('/join')) {
        window.location.replace(`/join?code=${encodeURIComponent(pendingCode)}`);
      }
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
    try {
      await api('/presence', { method: 'DELETE' });
    } catch {
      // Ignorar fallo de red al desconectar
    }
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
  const isLeaderUser = ['leader', 'lider', 'semillero_leader'].includes(realRole);
  const isStaffUser = ['admin', 'teacher', 'docente', 'profesor', 'leader', 'lider', 'semillero_leader'].includes(realRole);
  const isImpersonating = isStaffUser && viewMode === 'student';
  const effectiveRole = isImpersonating ? 'student' : realRole;

  const effectiveProfile = profile ? {
    ...profile,
    role: effectiveRole,
    real_role: realRole,
    isImpersonating
  } : null;

  const isStaff = isStaffUser && !isImpersonating;
  const isLeader = isLeaderUser && !isImpersonating;
  const canAccessCertificate = isStaff || totalPoints >= 450;

  const refreshSession = useCallback(() => validateSession(localStorage.getItem('saberlab-token')), []);
  const refreshEvaluations = useCallback(() => loadEvaluations(userRef.current?.id, profileRef.current?.role), []);
  const refreshNotifications = useCallback(() => loadNotifications(userRef.current?.id), []);
  const refreshUserProgress = useCallback(() => loadUserProgress(userRef.current?.id), []);
  const refreshLessonVisibility = useCallback(() => loadLessonVisibility(), []);

  return (
    <AuthContext.Provider value={{ 
        user, 
        profile: effectiveProfile, 
        effectiveRole: effectiveProfile?.role || 'student',
        realRole,
        viewMode,
        isStaffUser,
        isLeaderUser,
        isImpersonating,
        isStaff,
        isLeader,
        totalPoints,
        canAccessCertificate,
        isManageModeActive,
        setIsManageModeActive,
        toggleManageMode,
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
        refreshSession,
        refreshEvaluations,
        refreshNotifications,
        refreshUserProgress,
        refreshLessonVisibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

