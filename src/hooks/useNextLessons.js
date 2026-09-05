import { useCallback, useEffect, useState } from 'react';
import { modernQuizApi } from '@/utils/api/modernQuiz';

// If the request fails, fall back to offering all five types rather than
// leaving the home page with no tiles at all — simpler than trying to
// remember the last successful state, and erring toward showing more
// options rather than fewer feels like the safer failure mode here. `id` is
// null since there's no real row behind it — the lesson-generation endpoint
// already tolerates a missing choiceId, so picking a fallback tile just
// won't get recorded against anything.
const FALLBACK_CURRENT = {
  id: null,
  options: ['new_words', 'level_up', 'fix_mistakes', 'kanji_spotlight', 'from_the_top'],
  selectedType: null,
};

// Fetches the current user's { current, history } choice rows fresh on
// every mount, rather than caching across visits, since `current` can
// change between one home page load and the next (e.g. a lesson completed
// elsewhere).
export function useNextLessons() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await modernQuizApi.getNextLessons();
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
