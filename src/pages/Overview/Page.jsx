import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack, IoCaretUp, IoCaretDown } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { useWordProgress } from '@/hooks/useWordProgress';
import { WordTile } from '@/pages/Overview/WordTile';
import '@/pages/Overview/Page.scss';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// The sort toggles are mutually exclusive (only one is ever the active
// sort), unlike the JLPT filters — so besides the arrow/label, each one
// also carries `isActive` to show which is currently applied. The arrow
// itself always reflects the shared `isUp` direction regardless of which
// toggle is active, so whichever one you switch to next already reads the
// direction it'll apply.
const SORT_TOGGLES = [
  { key: 'recency', label: 'Recency' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'mastery', label: 'Mastery' },
];

// A two-state toggle rendered as a single button: the arrow + label shown
// is always the CURRENT state, and clicking switches to the other one — not
// a pair of buttons where the active one is highlighted. `isUp` picks the
// arrow; `label` stays the same across both states since it names the
// dimension being toggled (e.g. "Recency"), not the state itself.
function ToggleButton({ label, isUp, isActive, onClick }) {
  const Arrow = isUp ? IoCaretUp : IoCaretDown;
  return (
    <button
      type="button"
      className={cx('overview-page__toggle', isActive && 'overview-page__toggle--active')}
      aria-pressed={isActive}
      onClick={onClick}
    >
      <Arrow className="overview-page__toggle-arrow" />
      {label}
    </button>
  );
}

export function OverviewPage() {
  const {
    words,
    isLoading,
    isLoadingMore,
    hasMore,
    sortBy,
    sortDirection,
    selectSort,
    jlptLevel,
    setJlptLevel,
    loadMore,
  } = useWordProgress();
  const sentinelRef = useRef(null);

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
    <>
      <Helmet>
        <title>Your Progress</title>
      </Helmet>
      <div className="overview-page">
        <header className="overview-page__header">
          <div className="overview-page__nav">
            <Link to="/home" className="overview-page__back" aria-label="Back to home">
              <IoArrowBack />
            </Link>
            <h1 className="overview-page__title">Your Progress</h1>
            <OverflowMenu currentPage="overview" className="overview-page__menu" />
          </div>
          <div className="overview-page__controls">
            <div className="overview-page__filters" role="group" aria-label="Filter by JLPT level">
              {JLPT_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={cx(
                    'overview-page__filter-option',
                    `overview-page__filter-option--${level.toLowerCase()}`,
                    jlptLevel === level && 'overview-page__filter-option--active'
                  )}
                  aria-pressed={jlptLevel === level}
                  onClick={() => setJlptLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="overview-page__toggles" role="group" aria-label="Sort by">
              {SORT_TOGGLES.map(({ key, label }) => (
                <ToggleButton
                  key={key}
                  label={label}
                  isUp={sortDirection === 'desc'}
                  isActive={sortBy === key}
                  onClick={() => selectSort(key)}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="overview-page__content">
          {!isLoading && words.length === 0 && (
            <p className="overview-page__empty">
              {jlptLevel ? `No ${jlptLevel} words practiced yet.` : 'No words practiced yet.'}
            </p>
          )}

          <div className="overview-page__grid">
            {words.map(({ entry, mastery }) => (
              <WordTile entry={entry} mastery={mastery} key={entry.id} />
            ))}
          </div>

          {hasMore && (
            <div className="overview-page__sentinel" ref={sentinelRef}>
              {isLoadingMore && <span className="overview-page__loading-more">Loading more…</span>}
            </div>
          )}

          {/* Scoped to __content (its own position: relative), not the page
              as a whole — switching a toggle/filter re-covers just the
              results while the header's toggles/filters above stay visible
              and clickable throughout. */}
          <LoadingOverlay active={isLoading} />
        </div>
      </div>
    </>
  );
}
