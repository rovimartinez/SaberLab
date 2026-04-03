import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { COURSES_DEFINITION } from '../data/coursesData.jsx';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
      return;
    }

    const { data: enrollments, error } = await supabase
      .from('enrollments')
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
    } else {
      setEnrolledCourses([]);
    }
  };

  const loadNotificationsCount = async (userId) => {
    const { count, error } = await supabase
      .from('notifications')
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

  const refreshNotificationsCount = async () => {
    if (user) {
      await loadNotificationsCount(user.id);
    }
  };

  const loadPendingAccessRequestsCount = async () => {
    const { count, error } = await supabase
      .from('access_requests')
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
      .from('access_requests')
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

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', loggedInUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error consultando perfil:', profileError);
    }

    if (profileData) {
      setSessionRejected(false);
      clearPendingAccessData();
      setProfile(profileData);
      await loadEnrolledCourses(loggedInUser.id, profileData.role);
      await loadNotificationsCount(loggedInUser.id);
      if (profileData.role === 'admin') {
        await loadPendingAccessRequestsCount();
      } else {
        setPendingAccessRequestsCount(0);
      }
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

      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: loggedInUser.id,
            email: loggedInUser.email?.trim().toLowerCase(),
            full_name: googleName,
            role: 'student'
          },
          { onConflict: 'id' }
        )
        .select('id, email, full_name, role')
        .maybeSingle();

      if (newProfileError) {
        console.error('Error creando perfil luego de aprobacion:', newProfileError);
        resetAccessState();
        storePendingAccessData(loggedInUser, 'approved');
        setSessionRejected(false);
      } else {
        setSessionRejected(false);
        clearPendingAccessData();
        setProfile(newProfile);
        await loadEnrolledCourses(loggedInUser.id, newProfile.role);
        await loadNotificationsCount(loggedInUser.id);
        if (newProfile.role === 'admin') {
          await loadPendingAccessRequestsCount();
        } else {
          setPendingAccessRequestsCount(0);
        }
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
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSessionRejected(false);
    setEnrolledCourses([]);
    setUnreadNotificationsCount(0);
    setPendingAccessRequestsCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, sessionRejected, setSessionRejected, signInWithGoogle, signOut, enrolledCourses, unreadNotificationsCount, pendingAccessRequestsCount, refreshNotificationsCount, refreshEnrolledCourses, refreshPendingAccessRequestsCount }}>
      {children}
    </AuthContext.Provider>
  );
};
