import { useCallback, useEffect, useState } from 'react';

// Shared load/isLoading/error plumbing for every "{ days: [{ date, count
// }, ...] }" endpoint in the app (useEffort, useDailyActiveUsers,
// useDailyLessonsCompleted) — each just wraps this with its own API call
// rather than repeating the same fetch bookkeeping three times over.
export function useDailyCounts(fetchDays) {
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDays();
      setDays(response.days || []);
    } catch (apiError) {
      setError(apiError);
      setDays([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDays]);

  useEffect(() => {
    load();
  }, [load]);

  return { days, isLoading, error };
}
