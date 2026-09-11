import { useEffect, useRef } from 'react';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { WordTile } from '@/pages/Overview/WordTile';
import { useUserContext } from '@/contexts/UserContext';
import { hasFullAccess } from '@/utils/planAccess';
import { useWordsProgressContext } from './WordsProgressContext';
import '@/pages/Overview/Page.scss';

// The results grid + infinite-scroll sentinel, reading the shared
// useWordProgress instance via WordsProgressContext — a sibling of
// WordsControls (see that file) so the two can live in different parts of
// the page tree (header vs. content) while staying in sync.
export function WordsGrid() {
  const { words, isLoading, isLoadingMore, hasMore, jlptLevel, loadMore } = useWordsProgressContext();
  const sentinelRef = useRef(null);
  const { user } = useUserContext();
  const canAccessAllLevels = hasFullAccess(user);

  // Fires loadMore whenever the sentinel (just past the last card) scrolls
  // into view — observed unconditionally so the effect doesn't need to
  // rebind every time hasMore flips, but the ref itself is only rendered
  // into the DOM while hasMore is true (see below), so there's nothing left
  // to observe once every page has loaded.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div className="overview-page__content">
      {!isLoading && words.length === 0 && (
        <p className="overview-page__empty">
          {jlptLevel ? `No ${jlptLevel} words practiced yet.` : 'No words practiced yet.'}
        </p>
      )}

      <div className="overview-page__grid">
        {words.map(({ entry, mastery }) => (
          <WordTile entry={entry} mastery={mastery} canAccessAllLevels={canAccessAllLevels} key={entry.id} />
        ))}
      </div>

      {hasMore && (
        <div className="overview-page__sentinel" ref={sentinelRef}>
          {isLoadingMore && <span className="overview-page__loading-more">Loading more…</span>}
        </div>
      )}

      {/* Scoped to __content (its own position: relative), not the page as a
          whole — switching a toggle/filter re-covers just the results while
          the header's toggles/filters above stay visible and clickable
          throughout. */}
      <LoadingOverlay active={isLoading} />
    </div>
  );
}
