import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { COURSES_DEFINITION } from '../data/coursesData.jsx';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [lessonVisibility, setLessonVisibility] = useState({}); // { courseId: { lessonId: visible } }
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pendingAccessRequestsCount, setPendingAccessRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionRejected, setSessionRejected] = useState(false);

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
  };

  const activateResolvedProfile = async (loggedInUser, resolvedProfile) => {
    if (!loggedInUser || !resolvedProfile) return;

    setSessionRejected(false);
    clearPendingAccessData();
    setProfile(resolvedProfile);

    await loadEnrolledCourses(loggedInUser.id, resolvedProfile.role);
    await loadNotificationsCount(loggedInUser.id);

    if (resolvedProfile.role === 'admin') {
      await loadPendingAccessRequestsCount();
    } else {
      setPendingAccessRequestsCount(0);
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
      setEnrolledCourses(getAllCoursesWithProgress());
      // Cargar visibilidad para todos los cursos (IDs 1-6)
      const allCourseIds = [1, 2, 3, 4, 5, 6];
      await loadLessonVisibility(allCourseIds);
      return;
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
    } else {
      setEnrolledCourses([]);
    }
  };

  const loadNotificationsCount = async (userId) => {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (!error) {
      setUnreadNotificationsCount(count || 0);
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

  const validateSession = async (session) => {
    setLoading(true);
    const loggedInUser = session?.user ?? null;

    if (!loggedInUser) {
      setUser(null);
      setSessionRejected(false);
      resetAccessState();
      clearPendingAccessData();
      setLoading(false);
      return;
    }

    setUser(loggedInUser);

    const profileData = await getProfileForUser(loggedInUser);

    if (profileData) {
      // Verificar y actualizar avatar si es necesario
      
      // Si el perfil no tiene avatar pero el usuario tiene uno de Google, actualizar
      if (!profileData.avatar_url && loggedInUser.user_metadata?.avatar_url) {
        const { error: updateError } = await supabase
          .from('perfiles')
          .update({ avatar_url: loggedInUser.user_metadata.avatar_url })
          .eq('id', loggedInUser.id);
        
        if (updateError) {
          console.error('Error actualizando avatar:', updateError);
        }
      }
      await activateResolvedProfile(loggedInUser, profileData);
      setLoading(false);
      return;
    }

    const requestData = await getLatestAccessRequest(loggedInUser.email);

    if (requestData?.status === 'approved') {
      const googleName =
        loggedInUser.user_metadata?.full_name ||
        loggedInUser.user_metadata?.name ||
        loggedInUser.email?.split('@')[0] ||
        'Estudiante';

      const googleAvatar = loggedInUser.user_metadata?.avatar_url || null;

      const { data: newProfile, error: newProfileError } = await supabase
        .from('perfiles')
        .upsert(
          {
            id: loggedInUser.id,
            email: loggedInUser.email?.trim().toLowerCase(),
            full_name: googleName,
            avatar_url: googleAvatar,
            role: 'student'
          },
          { onConflict: 'id' }
        )
        .select('id, email, full_name, role')
        .single();

      if (newProfileError) {
        console.error('Error creando perfil luego de aprobacion:', newProfileError);
        resetAccessState();
        storePendingAccessData(loggedInUser, 'approved');
        setSessionRejected(false);
      } else {
        await activateResolvedProfile(loggedInUser, newProfile);
      }

      setLoading(false);
      return;
    }

    resetAccessState();
    const pendingStatus = requestData?.status || 'pending';
    storePendingAccessData(loggedInUser, pendingStatus);
    setSessionRejected(pendingStatus === 'rejected');
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      validateSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      validateSession(session);
    });

    return () => subscription.unsubscribe();
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
    <AuthContext.Provider value={{ user, profile, loading, sessionRejected, setSessionRejected, signInWithGoogle, signOut, enrolledCourses, lessonVisibility, unreadNotificationsCount, pendingAccessRequestsCount, refreshNotificationsCount, refreshEnrolledCourses, refreshPendingAccessRequestsCount }}>
      {children}
    </AuthContext.Provider>
  );
};
