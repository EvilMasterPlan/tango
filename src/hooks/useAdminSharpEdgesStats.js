import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/utils/api/admin';

const EMPTY_STATS = { topIncorrectCombos: [], topIncorrectWords: [] };

// Refetches whenever `days` changes — unlike useAdminSecurityStats (a fixed
// 30-day window), Sharp Edges' timeframe dropdown picks the window itself
// (see Admin/SharpEdges/Page.jsx), so the request has to go out again per
// selection rather than once on mount.
export function useAdminSharpEdgesStats(days) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getSharpEdgesStats(days);
      setStats(response || EMPTY_STATS);
    } catch (apiError) {
      setError(apiError);
      setStats(EMPTY_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...stats, isLoading, error };
}
