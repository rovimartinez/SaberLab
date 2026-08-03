import { createContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { api, setToken, clearToken } from '../lib/api';

import { COURSES_DEFINITION } from '../data/coursesData.jsx';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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
        setSessionRejected(false);
        clearPendingAccessData();
        setProfile(resolvedProfile);

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
      const { profile: p, courses } = await api('/profile');

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

  const loadNotificationsCount = async (userId) => {
    try {
      const { count } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      setUnreadNotificationsCount(count || 0);
    } catch (err) {
      console.error('Error loading notifications count:', err);
    }
  };

  const loadNotifications = async (userId) => {
    try {
        const { data } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            setNotifications(data);
            setUnreadNotificationsCount(data.filter(n => !n.read).length);
        }
    } catch (err) {
        console.error('Error loading notifications:', err);
    }
  };

  const refreshEnrolledCourses = async () => {
    if (user) {
      await loadEnrolledCourses(user.id, profile?.role);
    }
  };

  const loadLessonVisibility = async () => {
    try {
      const { visibility } = await api('/visibility');
      if (visibility && Object.keys(visibility).length > 0) {
        setLessonVisibility(visibility);
      }
    } catch (err) {
      console.error('Error cargando visibilidad de lecciones:', err);
    }
  };

  const refreshNotificationsCount = async () => {
    if (user) {
      await loadNotificationsCount(user.id);
    }
  };

  const loadPendingAccessRequestsCount = async () => {
    const { count, error } = await supabase
      .from('solicitudes_acceso')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (!error) {
      setPendingAccessRequestsCount(count || 0);
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
      let query = supabase
        .from('evaluaciones')
        .select('*')
        .order('due_date', { ascending: true });

      if (role !== 'admin') {
        const { data: enrollments } = await supabase
          .from('inscripciones')
          .select('course_id')
          .eq('user_id', userId);
        
        if (enrollments && enrollments.length > 0) {
          query = query.in('course_id', enrollments.map(e => e.course_id));
        } else {
          setEvaluations([]);
          return;
        }
      } else {
        query = query.eq('is_published', true);
      }

      const { data } = await query;
      if (data) setEvaluations(data);
    } catch (err) {
      console.error('Error loading evaluations:', err);
    }
  };

  const loadUserProgress = async (userId) => {
    try {
      const { data } = await supabase
        .from('progreso_usuario')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data) setUserProgress(data);
    } catch (err) {
      console.error('Error loading user progress:', err);
    }
  };

  const getLatestAccessRequest = async (email) => {
    if (!email) return null;

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from('solicitudes_acceso')
      .select('*')
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error consultando solicitud de acceso:', error);
      return null;
    }

    return data;
  };

  const getProfileForUser = async (loggedInUser) => {
    if (!loggedInUser?.id) return null;

    const normalizedEmail = loggedInUser.email?.trim().toLowerCase();

    const { data: profileById, error: profileByIdError } = await supabase
      .from('perfiles')
      .select('id, email, full_name, role')
      .eq('id', loggedInUser.id)
      .maybeSingle();

    if (profileByIdError) {
      console.error('Error consultando perfil por id:', profileByIdError);
    }

    if (profileById) {
      return profileById;
    }

    if (!normalizedEmail) {
      return null;
    }

    const { data: profileByEmail, error: profileByEmailError } = await supabase
      .from('perfiles')
      .select('id, email, full_name, role')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileByEmailError) {
      console.error('Error consultando perfil por email:', profileByEmailError);
      return null;
    }

    if (profileByEmail?.id && profileByEmail.id !== loggedInUser.id) {
      // Perfil encontrado pero con ID diferente - se usará el de auth
      return profileByEmail;
    }

    return profileByEmail ?? null;
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

      const { profile: p } = await api('/auth/me');
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
      // Si venimos de Google OAuth, el token llega en el hash: #/auth?token=...
      const rawHash = window.location.hash;
      let token = localStorage.getItem('saberlab-token');

      if (rawHash.includes('token=')) {
        const params = new URLSearchParams(rawHash.slice(rawHash.indexOf('?') + 1));
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

  return (
    <AuthContext.Provider value={{ 
        user, 
        profile, 
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
        refreshEvaluations: () => loadEvaluations(user?.id, profile?.role),
        refreshNotifications: () => loadNotifications(user?.id),
        refreshUserProgress: () => loadUserProgress(user?.id)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
