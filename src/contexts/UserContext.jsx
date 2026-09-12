import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { accountApi } from '@/utils/api/account';
import { authApi } from '@/utils/api/auth';
import { userSeemsAuthenticated } from '@/utils/auth';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // `trackLoading` is false for a background refresh (see refreshUser
  // below) — RequireAuth blanks the whole page while `isLoading` is true
  // (it doesn't yet know whether there's even a session to show), which is
  // right for the initial load but would otherwise unmount, then remount,
  // the entire authenticated page tree — losing any of its own local state
  // in the process (e.g. a Settings dialog open somewhere in it closing) —
  // every time something merely refreshes the already-known-authenticated
  // user's profile in the background, like SettingsDialog does after every
  // preference save.
  const loadUser = useCallback(async (trackLoading = true) => {
    setError(null);

    if (!userSeemsAuthenticated()) {
      setUser(null);
      if (trackLoading) setIsLoading(false);
      return;
    }

    if (trackLoading) setIsLoading(true);
    try {
      const profile = await accountApi.loadProfile();
      setUser(profile || null);
    } catch (apiError) {
      setUser(null);
      setError(apiError?.response?.data?.error || 'Failed to load user profile');
    } finally {
      if (trackLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // A background re-fetch of the same profile, e.g. after saving a
  // preference — see loadUser's own `trackLoading` param above for why this
  // deliberately doesn't touch `isLoading`.
  const refreshUser = useCallback(() => loadUser(false), [loadUser]);

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
      refreshUser,
      logout,
    }),
    [user, isLoading, error, refreshUser, logout],
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
