import { useCallback, useEffect, useRef } from 'react';

// Delays invoking `callback` until `delayMs` has passed since the last call
// — coalesces a burst of rapid calls (e.g. several settings toggles in a
// row) into a single trailing call with the latest arguments, rather than
// firing one network request per click. `callback` is read via a ref kept
// current on every render, so the debounced function it returns stays
// stable across renders without going stale.
//
// Flushes (fires immediately) rather than drops a still-pending call on
// unmount — closing a dialog right after the last toggle, before the
// debounce window elapses, shouldn't silently lose that change.
export function useDebouncedCallback(callback, delayMs) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef(null);
  const pendingArgsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        callbackRef.current(...pendingArgsRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args) => {
      pendingArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        pendingArgsRef.current = null;
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs],
  );
}
