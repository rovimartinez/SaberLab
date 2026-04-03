import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionRejected, setSessionRejected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      validateSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      validateSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validateSession = async (session) => {
      const loggedInUser = session?.user ?? null;
      
      if (loggedInUser) {
          // Cargar perfil del usuario desde la tabla profiles
          const { data: profileData } = await supabase
              .from('profiles')
              .select('id, email, full_name, role')
              .eq('id', loggedInUser.id)
              .single();
          
          setProfile(profileData ?? null);
      } else {
          setProfile(null);
      }
      
      setUser(loggedInUser);
      setLoading(false);
  };

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
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, sessionRejected, setSessionRejected, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
