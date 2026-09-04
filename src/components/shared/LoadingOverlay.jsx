import { useEffect, useState } from 'react';
import { cx } from '@/utils/cx';
import './LoadingOverlay.scss';

// Must match the opacity transition duration in LoadingOverlay.scss — stays
// mounted (fading out) for this long after `active` goes false, instead of
// disappearing the instant the underlying page is ready.
const FADE_MS = 300;

// A full-cover spinner over whatever positioned ancestor renders this —
// same background as the page behind it, no border/edge, so it simply caps
// the page until `active` goes false, then fades away to reveal whatever
// was loading underneath. Pair with useMinimumLoadingDuration so a fast API
// response doesn't flash this for a single frame.
export function LoadingOverlay({ active }) {
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      return;
    }
    const timeout = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(timeout);
  }, [active]);

  if (!mounted) return null;

  return (
    <div className={cx('loading-overlay', !active && 'loading-overlay--hidden')} aria-hidden={!active}>
      <div className="loading-overlay__spinner" />
    </div>
  );
}
