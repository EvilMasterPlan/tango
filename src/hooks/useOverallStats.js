import { useCallback, useEffect, useState } from 'react';
import { quizApi } from '@/utils/api/quiz';

export function useOverallStats() {
  const [points, setPoints] = useState(0);
  const [wordsDiscovered, setWordsDiscovered] = useState(0);
  const [jlptLevels, setJlptLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await quizApi.getOverallStats();
      setPoints(response.points || 0);
      setWordsDiscovered(response.wordsDiscovered || 0);
      setJlptLevels(response.jlptLevels || []);
    } catch (apiError) {
      setError(apiError);
      setPoints(0);
      setWordsDiscovered(0);
      setJlptLevels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { points, wordsDiscovered, jlptLevels, isLoading, error };
}
