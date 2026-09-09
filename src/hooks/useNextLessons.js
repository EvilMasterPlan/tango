import { useCallback, useEffect, useState } from 'react';
import { quizApi } from '@/utils/api/quiz';
import { ALL_LESSON_TYPES } from '@/utils/lessonTypeMetadata';
import { useUserContext } from '@/contexts/UserContext';
import { JLPT_FOCUS_LEVELS_PREFERENCE_KEY } from '@/utils/jlptFocusFilters';

// If the request fails, fall back to offering every known type rather than
// leaving the home page with no tiles at all — simpler than trying to
// remember the last successful state, and erring toward showing more
// options rather than fewer feels like the safer failure mode here.
const FALLBACK_CURRENT = {
  options: ALL_LESSON_TYPES,
};

// Fetches the user's recommended options + recent lesson history fresh on
// mount, and again whenever their saved JLPT focus-mode preference changes
// — `current` is freshly derived server-side from it on every call (see
// getNextLessons), so a stale local copy would otherwise keep showing
// recommendations from before the change until a full page reload. The
// Settings dialog (see SettingsDialog.jsx) already calls UserContext's
// refreshUser after every save, which is what actually surfaces the new
// value here — this hook just needs to notice it changed and re-fetch, the
// same "state in a dependency array" pattern useWordProgress.js already
// uses for its own JLPT filter. Nothing else about this hook's data is
// worth caching across calls, so there's no separate cache to invalidate.
export function useNextLessons() {
  const { user } = useUserContext();
  const focusLevelsValue = user?.preferences?.[JLPT_FOCUS_LEVELS_PREFERENCE_KEY];

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
  }, [load, focusLevelsValue]);

  return { current, history, isLoading, error };
}
