import { createContext, useContext, useEffect, useState } from 'react';
import { sb } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(u) {
    if (!u) { setProfile(null); return; }
    const { data } = await sb.from('profiles').select('*').eq('id', u.id).single();
    setProfile(data || null);
  }

  useEffect(() => {
    sb.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      loadProfile(user).finally(() => setLoading(false));
    });
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      loadProfile(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    await sb.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile: () => loadProfile(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
