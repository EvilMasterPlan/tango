import { useCallback, useEffect, useState } from 'react';
import { modernQuizApi } from '@/utils/api/modernQuiz';

// If the request fails, fall back to unlocking all three rather than
// leaving the home page with no tiles at all — simpler than trying to
// remember the last successful unlock state, and erring toward showing
// more options rather than fewer feels like the safer failure mode here.
const FALLBACK_NEXT_LESSONS = [
  { type: 'new_words' },
  { type: 'level_up' },
  { type: 'fix_mistakes' },
  { type: 'kanji_spotlight' },
];

// Fetches the current user's unlocked lesson types fresh on every mount —
// see OvermindAPI's tango/quiz.js getNextLessons — rather than caching
// across visits, since which types are unlocked (and their shuffled order)
// can change between one home page load and the next.
export function useNextLessons() {
  const [nextLessons, setNextLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { nextLessons: lessons } = await modernQuizApi.getNextLessons();
      setNextLessons(lessons || []);
    } catch (apiError) {
      setError(apiError);
      setNextLessons(FALLBACK_NEXT_LESSONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { nextLessons, isLoading, error };
}
