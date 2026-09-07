import { useCallback, useEffect, useRef, useState } from 'react';
import { quizApi } from '@/utils/api/quiz';

const PAGE_SIZE = 30;

// Infinite-scroll pagination for the /overview word grid. `isLoading` is
// only true for a sort's very first page (drives a full-cover
// LoadingOverlay); later pages toggle `isLoadingMore` instead (drives a
// small inline indicator at the bottom of the grid).
//
// `selectSort('recency' | 'challenge' | 'mastery')` and
// `setJlptLevel('N5' | ... | null)` each reset `words`/offset/`hasMore` and
// re-fetch page one under the new sort/filter. A generation counter
// (`requestIDRef`), bumped on every reset, lets an in-flight request from
// the sort/filter just abandoned recognize itself as stale and discard its
// result instead of clobbering the new one's (already-reset) state once it
// resolves.
export function useWordProgress() {
  const [sortBy, setSortBy] = useState('recency');
  const [sortDirection, setSortDirection] = useState('desc');
  const [jlptLevel, setJlptLevel] = useState(null);
  const [words, setWords] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const requestIDRef = useRef(0);

  const fetchPage = useCallback(async (by, direction, level, offset, requestID) => {
    loadingRef.current = true;
    if (offset === 0) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const response = await quizApi.getWordProgress(offset, PAGE_SIZE, by, direction, level);
      if (requestID !== requestIDRef.current) return; // a newer sort/jlptLevel reset this away — discard.

      const page = response.words || [];
      offsetRef.current = offset + PAGE_SIZE;
      setWords((prev) => (offset === 0 ? page : [...prev, ...page]));
      setHasMore(Boolean(response.hasMore));
    } catch (apiError) {
      if (requestID !== requestIDRef.current) return;
      setError(apiError);
      setHasMore(false);
    } finally {
      if (requestID === requestIDRef.current) {
        loadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    fetchPage(sortBy, sortDirection, jlptLevel, offsetRef.current, requestIDRef.current);
  }, [fetchPage, hasMore, sortBy, sortDirection, jlptLevel]);

  // Toggles jlptLevel off if the same filter is clicked again, applies it
  // otherwise — filters are off by default and only one can be active.
  const toggleJlptLevel = useCallback((level) => {
    setJlptLevel((current) => (current === level ? null : level));
  }, []);

  // The three sort toggles (Recency/Challenge/Mastery) are mutually
  // exclusive, unlike the filters — clicking the already-active one flips
  // its direction (the "click switches to the not-currently-shown state"
  // toggle philosophy), clicking a different one switches to it without
  // touching direction, so whichever toggle you land on next reads the
  // same up/down as whatever was already selected.
  const selectSort = useCallback(
    (criterion) => {
      if (criterion === sortBy) {
        setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
      } else {
        setSortBy(criterion);
      }
    },
    [sortBy]
  );

  // Fires on mount and every sortBy/sortDirection/jlptLevel change — resets
  // local state and starts a fresh page one under the (possibly new)
  // sort/filter. Bumping requestIDRef first invalidates any still-in-flight
  // request from a just-abandoned sort/filter (see fetchPage's requestID
  // check above).
  useEffect(() => {
    requestIDRef.current += 1;
    offsetRef.current = 0;
    loadingRef.current = false;
    setWords([]);
    setHasMore(true);
    fetchPage(sortBy, sortDirection, jlptLevel, 0, requestIDRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortDirection, jlptLevel]);

  return {
    words,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sortBy,
    sortDirection,
    selectSort,
    jlptLevel,
    setJlptLevel: toggleJlptLevel,
    loadMore,
  };
}
