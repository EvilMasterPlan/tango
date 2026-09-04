import { useCallback, useEffect, useRef, useState } from 'react';
import { modernQuizApi } from '@/utils/api/modernQuiz';

const PAGE_SIZE = 30;

// Infinite-scroll pagination for the /overview word grid. `isLoading` is
// only true for a sort order's very first page (drives a full-cover
// LoadingOverlay); later pages toggle `isLoadingMore` instead (drives a
// small inline indicator at the bottom of the grid).
//
// `setSortOrder('newest' | 'oldest')` resets `words`/offset/`hasMore` and
// re-fetches page one under the new order — see the toggle in
// Overview/Page.jsx. A generation counter (`requestIDRef`), bumped on every
// reset, lets an in-flight request from the order just abandoned recognize
// itself as stale and discard its result instead of clobbering the new
// order's (already-reset) state once it resolves.
export function useWordProgress() {
  const [sortOrder, setSortOrder] = useState('newest');
  const [words, setWords] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const requestIDRef = useRef(0);

  const fetchPage = useCallback(async (order, offset, requestID) => {
    loadingRef.current = true;
    if (offset === 0) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const response = await modernQuizApi.getWordProgress(offset, PAGE_SIZE, order);
      if (requestID !== requestIDRef.current) return; // a newer sortOrder reset this away — discard.

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
    fetchPage(sortOrder, offsetRef.current, requestIDRef.current);
  }, [fetchPage, hasMore, sortOrder]);

  // Fires on mount and every sortOrder change — resets local state and
  // starts a fresh page one under the (possibly new) order. Bumping
  // requestIDRef first invalidates any still-in-flight request from a
  // just-abandoned order (see fetchPage's requestID check above).
  useEffect(() => {
    requestIDRef.current += 1;
    offsetRef.current = 0;
    loadingRef.current = false;
    setWords([]);
    setHasMore(true);
    fetchPage(sortOrder, 0, requestIDRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  return { words, isLoading, isLoadingMore, hasMore, error, sortOrder, setSortOrder, loadMore };
}
