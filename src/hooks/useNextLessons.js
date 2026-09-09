import { useCallback, useEffect, useState } from 'react';
import { quizApi } from '@/utils/api/quiz';
import { ALL_LESSON_TYPES } from '@/utils/lessonTypeMetadata';

// If the request fails, fall back to offering every known type rather than
// leaving the home page with no tiles at all — simpler than trying to
// remember the last successful state, and erring toward showing more
// options rather than fewer feels like the safer failure mode here.
const FALLBACK_CURRENT = {
  options: ALL_LESSON_TYPES,
};

// Fetches the user's recommended options + recent lesson history fresh on
// every mount, rather than caching across visits — `current` is freshly
// derived server-side on every call in the first place (see
// getNextLessons), so there's no stable state here worth caching anyway.
export function useNextLessons() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await quizApi.getNextLessons();
      setCurrent(response.current || FALLBACK_CURRENT);
      setHistory(response.history || []);
    } catch (apiError) {
      setError(apiError);
      setCurrent(FALLBACK_CURRENT);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { current, history, isLoading, error };
}
