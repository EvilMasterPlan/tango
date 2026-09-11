import { useState } from 'react';
import { IoCaretUp, IoCaretDown, IoFilterOutline } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { useDismissablePopover } from '@/hooks/useDismissablePopover';
import { useWordsProgressContext } from './WordsProgressContext';
import '@/pages/Overview/Page.scss';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

// Mobile-only stand-in for __filters (see WordsControls' own desktop row
// below, which overflows a narrow viewport with 5 filter buttons + 3 sort
// toggles side by side) — collapses the JLPT filter buttons into a single
// trigger with a popup list. Picking a level applies it immediately (same
// toggle-off-if-already-active behavior as the desktop buttons) but leaves
// the popup open, since filters (unlike sort) aren't mutually exclusive
// with "nothing changes about the rest of your view" — you might want to
// glance at the result and then pick a different level right after.
function FilterButton() {
  const { jlptLevel, setJlptLevel } = useWordsProgressContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissablePopover(isOpen, () => setIsOpen(false));

  return (
    <div className="overview-page__mobile-control" ref={ref}>
      <button
        type="button"
        className={cx('overview-page__mobile-trigger', jlptLevel && 'overview-page__mobile-trigger--active')}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <IoFilterOutline />
        Filter{jlptLevel ? `: ${jlptLevel}` : ''}
      </button>

      {isOpen && (
        <div className="overview-page__mobile-popup" role="group" aria-label="Filter by JLPT level">
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
      )}
    </div>
  );
}

// Mobile-only stand-in for __toggles — same idea as FilterButton above, but
// for the three mutually-exclusive sort criteria. Unlike a filter, picking a
// sort fully replaces what you're looking at (there's always exactly one
// active sort), so there's nothing left to compare it against — the popup
// closes as soon as an option is picked.
function SortButton() {
  const { sortBy, sortDirection, selectSort } = useWordsProgressContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissablePopover(isOpen, () => setIsOpen(false));
  const activeSort = SORT_TOGGLES.find(({ key }) => key === sortBy);
  const Arrow = sortDirection === 'asc' ? IoCaretUp : IoCaretDown;

  return (
    <div className="overview-page__mobile-control" ref={ref}>
      <button
        type="button"
        className="overview-page__mobile-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Arrow />
        Sort{activeSort ? `: ${activeSort.label}` : ''}
      </button>

      {isOpen && (
        <div className="overview-page__mobile-popup" role="group" aria-label="Sort by">
          {SORT_TOGGLES.map(({ key, label }) => (
            <ToggleButton
              key={key}
              label={label}
              isUp={sortDirection === 'asc'}
              isActive={sortBy === key}
              onClick={() => {
                selectSort(key);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// The sort toggles are mutually exclusive (only one is ever the active
// sort), unlike the JLPT filters — so besides the arrow/label, each one
// also carries `isActive` to show which is currently applied. The arrow
// itself always reflects the shared `isUp` direction regardless of which
// toggle is active, so whichever one you switch to next already reads the
// direction it'll apply. Down = desc (most-recent/highest-score/
// highest-mastery first, per quizApi.getWordProgress), up = asc.
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

// The full inline row of filter/sort buttons (desktop) plus the collapsed
// FilterButton/SortButton pair (mobile) — both read/write the shared
// useWordProgress instance via WordsProgressContext, so this can be dropped
// into any header (the standalone /words page's own header, or the
// combined /overview page's header when its mode is Words) without prop
// drilling from wherever that header happens to live.
export function WordsControls() {
  const { jlptLevel, setJlptLevel, sortBy, sortDirection, selectSort } = useWordsProgressContext();

  return (
    <>
      {/* Plenty of room on a wide viewport, but 5 filters + 3 toggles side
          by side runs off the edge of a phone screen, so this row is
          desktop-only (see Page.scss) with the collapsed
          FilterButton/SortButton pair below taking over on mobile. */}
      <div className="overview-page__controls overview-page__controls--desktop">
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
              isUp={sortDirection === 'asc'}
              isActive={sortBy === key}
              onClick={() => selectSort(key)}
            />
          ))}
        </div>
      </div>

      <div className="overview-page__controls overview-page__controls--mobile">
        <FilterButton />
        <SortButton />
      </div>
    </>
  );
}
