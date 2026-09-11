import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/utils/api/admin';

const EMPTY_STATS = { totalUsers: 0, usersByPlan: { FREE: 0, BETA: 0, PRO: 0 }, totalWordsDiscovered: 0, totalLessonsCompleted: 0 };

// All-time admin stat tiles (Admin/Dashboard/Page.jsx) — unlike
// useDailyActiveUsers/useDailyLessonsCompleted, this isn't a "{ days: [...]
// }" shape, so it doesn't fit the shared useDailyCounts hook those two use.
export function useAdminOverallStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getOverallStats();
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

  return { stats, isLoading, error };
}
