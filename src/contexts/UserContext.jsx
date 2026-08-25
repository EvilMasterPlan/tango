import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { accountApi } from '@/utils/api/account';
import { authApi } from '@/utils/api/auth';
import { userSeemsAuthenticated } from '@/utils/auth';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    setError(null);

    if (!userSeemsAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const profile = await accountApi.loadProfile();
      setUser(profile || null);
    } catch (apiError) {
      setUser(null);
      setError(apiError?.response?.data?.message || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      refreshUser: loadUser,
      logout,
    }),
    [user, isLoading, error, loadUser, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
