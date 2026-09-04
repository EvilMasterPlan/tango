import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { MasteryPentagon } from '@/components/quiz/charts/MasteryPentagon';
import { FuriganaWord } from '@/components/quiz/vocabulary/VocabularyDisplay';
import { useWordProgress } from '@/hooks/useWordProgress';
import '@/pages/Overview/Page.scss';

export function OverviewPage() {
  const { words, isLoading, isLoadingMore, hasMore, sortOrder, setSortOrder, loadMore } = useWordProgress();
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
          <Link to="/home" className="overview-page__back" aria-label="Back to home">
            <IoArrowBack />
          </Link>
          <h1 className="overview-page__title">Your Progress</h1>
          <div className="overview-page__sort" role="group" aria-label="Sort order">
            <button
              type="button"
              className={cx('overview-page__sort-option', sortOrder === 'oldest' && 'overview-page__sort-option--active')}
              onClick={() => setSortOrder('oldest')}
            >
              Oldest
            </button>
            <button
              type="button"
              className={cx('overview-page__sort-option', sortOrder === 'newest' && 'overview-page__sort-option--active')}
              onClick={() => setSortOrder('newest')}
            >
              Newest
            </button>
          </div>
        </header>

        <div className="overview-page__content">
          {!isLoading && words.length === 0 && <p className="overview-page__empty">No words practiced yet.</p>}

          <div className="overview-page__grid">
            {words.map(({ entry, mastery }) => (
              <div className="overview-page__card" key={entry.id}>
                <div className="overview-page__word-info">
                  <FuriganaWord furigana={entry.furigana} />
                  <div className="overview-page__definition">{entry.definition}</div>
                </div>
                <MasteryPentagon mastery={mastery} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="overview-page__sentinel" ref={sentinelRef}>
              {isLoadingMore && <span className="overview-page__loading-more">Loading more…</span>}
            </div>
          )}
        </div>

        <LoadingOverlay active={isLoading} />
      </div>
    </>
  );
}
