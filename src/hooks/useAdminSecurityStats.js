import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/utils/api/admin';

const EMPTY_STATS = { topNotFoundPaths: [], topNotFoundUsers: [], topNotFoundIPs: [] };

export function useAdminSecurityStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getSecurityStats();
      setStats(response || EMPTY_STATS);
    } catch (apiError) {
      setError(apiError);
      setStats(EMPTY_STATS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...stats, isLoading, error };
}
