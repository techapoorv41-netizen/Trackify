import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { load, save, remove } from '@/services/storageService';
import { DEMO_USER_IDS } from '@/utils/constants';

/**
 * Demo-only session. There is no real authentication: choosing a role simply stores
 * { role, userId } in LocalStorage so the interface can be explored.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => load('session', null));

  const signIn = useCallback((role) => {
    const next = { role, userId: DEMO_USER_IDS[role] };
    save('session', next);
    setSession(next);
    return next;
  }, []);

  const switchRole = signIn;

  const signOut = useCallback(() => {
    remove('session');
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, signIn, switchRole, signOut }), [session, signIn, switchRole, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
