import { useCallback, useEffect, useState } from 'react';
import { accountApi } from '@/utils/api/account';

export function useActivityHistory() {
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await accountApi.getActivityHistory();
      setActivity(response.activity || []);
    } catch (apiError) {
      setError(apiError);
      setActivity([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { activity, isLoading, error };
}
