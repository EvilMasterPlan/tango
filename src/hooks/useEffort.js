import { useCallback, useEffect, useState } from 'react';
import { quizApi } from '@/utils/api/quiz';

export function useEffort() {
  const [days, setDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await quizApi.getEffort();
      setDays(response.days || []);
    } catch (apiError) {
      setError(apiError);
      setDays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { days, isLoading, error };
}
