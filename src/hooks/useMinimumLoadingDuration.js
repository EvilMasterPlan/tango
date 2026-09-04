import { useEffect, useRef, useState } from 'react';

// Keeps returning true for at least `minDurationMs` after `isLoading` first
// goes true, even if `isLoading` itself flips back to false almost
// immediately (a wicked-fast API response) — avoids a loading spinner that
// flashes for a single frame and reads as a glitch rather than a load.
// Never delays the other direction: if `isLoading` is still true once the
// minimum has elapsed, this keeps returning true until it isn't.
export function useMinimumLoadingDuration(isLoading, minDurationMs = 300) {
  const [shouldShow, setShouldShow] = useState(isLoading);
  const startedAtRef = useRef(isLoading ? Date.now() : null);

  useEffect(() => {
    if (isLoading) {
      startedAtRef.current ??= Date.now();
      setShouldShow(true);
      return;
    }

    if (startedAtRef.current === null) {
      setShouldShow(false);
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = minDurationMs - elapsed;
    if (remaining <= 0) {
      startedAtRef.current = null;
      setShouldShow(false);
      return;
    }

    const timeout = setTimeout(() => {
      startedAtRef.current = null;
      setShouldShow(false);
    }, remaining);
    return () => clearTimeout(timeout);
  }, [isLoading, minDurationMs]);

  return shouldShow;
}
