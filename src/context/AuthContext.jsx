import { createContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

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
      // Cargar visibilidad para todos los cursos (IDs 1-6)
      const allCourseIds = [1, 2, 3, 4, 5, 6];
      await loadLessonVisibility(allCourseIds);
      return allCourses;
    }

    const { data: enrollments, error } = await supabase
      .from('inscripciones')
      .select('course_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error cargando cursos:', error);
      return;
    }

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map((enrollment) => enrollment.course_id);

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

  const loadLessonVisibility = async (courseIds) => {
    if (!courseIds || courseIds.length === 0) return;
    try {
      const { data } = await supabase
        .from('visibilidad_curso')
        .select('course_id, lecciones')
        .in('course_id', courseIds);
      
      if (data && data.length > 0) {
        const visibilityMap = {};
        data.forEach(v => {
          // lecciones es JSON: { 're-m1-l1': false, 're-m1-l2': true }
          visibilityMap[v.course_id] = v.lecciones || {};
        });
        setLessonVisibility(prev => ({ ...prev, ...visibilityMap }));
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

  const validateSession = async (session, currentUserState, currentProfileState) => {
    try {
        const loggedInUser = session?.user ?? null;

        // Skip if we already have a valid session with the same user
        if (currentUserState && currentProfileState && loggedInUser?.id === currentUserState.id) {
          return;
        }

        // Only show loading on initial load or when session is cleared
        if (!loggedInUser) {
          setUser(null);
          setSessionRejected(false);
          resetAccessState();
          clearPendingAccessData();
          setLoading(false);
          return;
        }

        // If we have a user but no profile (or different user), we need to load it
        if (!currentUserState || loggedInUser.id !== currentUserState.id) {
            setLoading(true);
        }

        setUser(loggedInUser);

        const profileData = await getProfileForUser(loggedInUser);

        if (profileData) {
          // Actualizar avatar si es necesario...
          if (!profileData.avatar_url && loggedInUser.user_metadata?.avatar_url) {
            try {
              await supabase
                .from('perfiles')
                .update({ avatar_url: loggedInUser.user_metadata.avatar_url })
                .eq('id', loggedInUser.id);
            } catch (e) {
              console.error('Error updating avatar:', e);
            }
          }
          await activateResolvedProfile(loggedInUser, profileData);
          return;
        }

        const requestData = await getLatestAccessRequest(loggedInUser.email);

        if (requestData?.status === 'approved') {
          const googleName = loggedInUser.user_metadata?.full_name || loggedInUser.user_metadata?.name || loggedInUser.email?.split('@')[0] || 'Estudiante';
          const googleAvatar = loggedInUser.user_metadata?.avatar_url || null;

          const { data: insertProfile, error: insertError } = await supabase
            .from('perfiles')
            .insert({
              id: loggedInUser.id,
              email: loggedInUser.email?.trim().toLowerCase(),
              full_name: googleName,
              avatar_url: googleAvatar,
              role: 'student'
            })
            .select('id, email, full_name, role')
            .single();

          if (insertError) {
            if (insertError.code === '23505') {
              const { data: updateProfile, error: updateError } = await supabase
                .from('perfiles')
                .update({
                  id: loggedInUser.id,
                  full_name: googleName,
                  avatar_url: googleAvatar,
                  role: 'student'
                })
                .eq('email', loggedInUser.email?.trim().toLowerCase())
                .select('id, email, full_name, role')
                .single();

              if (!updateError) await activateResolvedProfile(loggedInUser, updateProfile);
            } else {
                storePendingAccessData(loggedInUser, 'approved');
            }
          } else {
            await activateResolvedProfile(loggedInUser, insertProfile);
          }
          return;
        }

        resetAccessState();
        const pendingStatus = requestData?.status || 'pending';
        storePendingAccessData(loggedInUser, pendingStatus);
        setSessionRejected(pendingStatus === 'rejected');
    } catch (err) {
        console.error('Session validation error:', err);
        setUser(null);
        setProfile(null);
    } finally {
        setLoading(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    // Obtenemos la sesion inicial
    supabase.auth.getSession()
        .then((result) => {
            const session = result?.data?.session ?? null;
            validateSession(session, null, null);
        })
        .catch(err => {
            console.error('Initial session error:', err);
            setLoading(false);
        });

    const res = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'TOKEN_REFRESHED' && userRef.current) return;
      validateSession(session, userRef.current, profileRef.current);
    });

    const subscription = res?.data?.subscription ?? res?.data ?? res;

    return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user || profile) {
      return undefined;
    }

    let cancelled = false;

    const retryProfileResolution = async () => {
      const resolvedProfile = await getProfileForUser(user);

      if (cancelled || !resolvedProfile) {
        return;
      }

      await activateResolvedProfile(user, resolvedProfile);
    };

    const timeoutId = window.setTimeout(() => {
      void retryProfileResolution();
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user]);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      setPendingAccessRequestsCount(0);
      return undefined;
    }

    refreshPendingAccessRequestsCount();

    const channel = supabase
      .channel(`admin-access-requests-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'access_requests' },
        () => {
          refreshPendingAccessRequestsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role]);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }

    if (data?.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
      return data;
    }

    throw new Error('Supabase no devolvio una URL de autenticacion para Google.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSessionRejected(false);
    clearPendingAccessData();
    setEnrolledCourses([]);
    setUnreadNotificationsCount(0);
    setPendingAccessRequestsCount(0);
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
