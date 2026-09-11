import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack, IoChevronDown } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { useDismissablePopover } from '@/hooks/useDismissablePopover';
import { WordsProgressProvider } from '@/pages/Overview/WordsProgressContext';
import { WordsControls } from '@/pages/Overview/WordsControls';
import { WordsGrid } from '@/pages/Overview/WordsGrid';
import { AchievementsGrid } from '@/pages/Achievements/AchievementsGrid';
import { EffortCharts } from '@/pages/Effort/EffortCharts';
import '@/pages/Dashboard/Page.scss';

// The three standalone pages this combines (see pages/Overview, /Effort,
// /Achievements) — this is the only place that still links to them
// directly; everywhere else in the app should link to /overview?mode=<key>
// instead (see DEFAULT_MODE below for why `words` itself omits the param).
const MODES = [
  { key: 'words', label: 'Words' },
  { key: 'achievement', label: 'Achievements' },
  { key: 'effort', label: 'Effort' },
];

const MODE_KEYS = MODES.map(({ key }) => key);
const DEFAULT_MODE = 'words';

// Stands in for the page's <h1> — clicking it opens a popup to switch which
// of the three modes is showing, same trigger+popup pattern as Overview's
// own FilterButton/SortButton. Picking a mode fully replaces the page
// content (there's always exactly one active mode), so the popup closes as
// soon as one is picked.
function ModeDropdown({ mode, setMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useDismissablePopover(isOpen, () => setIsOpen(false));
  const activeMode = MODES.find(({ key }) => key === mode);

  return (
    <div className="dashboard-page__mode" ref={ref}>
      <button
        type="button"
        className="dashboard-page__mode-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {activeMode.label}
        <IoChevronDown className="dashboard-page__mode-chevron" />
      </button>

      {isOpen && (
        <ul className="dashboard-page__mode-popup" role="menu" aria-label="Switch view">
          {MODES.map(({ key, label }) => (
            <li key={key} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={key === mode}
                className={cx('dashboard-page__mode-option', key === mode && 'dashboard-page__mode-option--active')}
                onClick={() => {
                  setMode(key);
                  setIsOpen(false);
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get('mode');
  // An unrecognized/missing ?mode falls back to Words rather than 404ing or
  // rendering nothing — same "just pick a sane default" spirit as the app's
  // other query-driven state.
  const mode = MODE_KEYS.includes(requestedMode) ? requestedMode : DEFAULT_MODE;

  // Words is the default mode, so switching back to it drops the param
  // entirely (?mode=words also works, this just keeps the canonical URL
  // clean) — switching to anything else sets it. `replace: true` so
  // clicking through Words → Achievements → Effort doesn't fill up back
  // history with one entry per mode switch.
  const setMode = (nextMode) => {
    setSearchParams(nextMode === DEFAULT_MODE ? {} : { mode: nextMode }, { replace: true });
  };

  const page = (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__nav">
          <Link to="/home" className="dashboard-page__back" aria-label="Back to home">
            <IoArrowBack />
          </Link>
          <ModeDropdown mode={mode} setMode={setMode} />
          <OverflowMenu currentPage="overview" className="dashboard-page__menu" />
        </div>

        {/* Words is the only mode with extra header controls (filter/sort) —
            this row simply doesn't render for the other two, so the header
            shrinks back to a single line. */}
        {mode === 'words' && <WordsControls />}
      </header>

      <div className="dashboard-page__content">
        {mode === 'words' && <WordsGrid />}
        {mode === 'achievement' && <AchievementsGrid />}
        {mode === 'effort' && <EffortCharts />}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Overview</title>
      </Helmet>
      {/* Only Words needs a useWordProgress instance shared between the
          header's WordsControls and the content's WordsGrid — wrapping the
          whole page (rather than just the content) so both sit under the
          same provider despite living in different parts of the tree. Not
          mounted for the other two modes, so switching away doesn't leave a
          stale words fetch running. */}
      {mode === 'words' ? <WordsProgressProvider>{page}</WordsProgressProvider> : page}
    </>
  );
}
