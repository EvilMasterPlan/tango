import { useCallback, useEffect, useState } from 'react';
import { modernQuizApi } from '@/utils/api/modernQuiz';

export function useAchievements() {
  const [achievements, setAchievements] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await modernQuizApi.getAchievements();
      setAchievements(response.channels || {});
    } catch (apiError) {
      setError(apiError);
      setAchievements({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { achievements, isLoading, error };
}
