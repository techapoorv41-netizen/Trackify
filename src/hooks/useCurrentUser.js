import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ROLES } from '@/utils/constants';

export function useCurrentUser() {
  const { session } = useAuth();
  const { users } = useData();
  return useMemo(() => {
    if (!session) return { user: null, role: null, roleMeta: null, instituteId: null };
    const user = users.find((u) => u.id === session.userId) || null;
    return {
      user,
      role: session.role,
      roleMeta: ROLES[session.role],
      instituteId: user?.instituteId || null,
    };
  }, [session, users]);
}
