import { useState } from 'react';
import { CoinIcon } from '@/components/quiz/summary/CoinIcon';
import { MasteryGemIcon } from '@/components/shared/MasteryGemIcon';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { StatsDialog } from '@/pages/Home/StatsDialog';
import './HomeHeader.scss';

// Sticky header for the home page. `points`, `wordsDiscovered`, and
// `jlptLevels` come from the parent page rather than fetched here, so their
// loading state can be combined with the rest of the page's.
export function HomeHeader({ points, wordsDiscovered, jlptLevels }) {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  return (
    <header className="home-header">
      <button type="button" className="home-header__coins" onClick={() => setIsStatsOpen(true)}>
        <CoinIcon />
        <span className="home-header__coin-count">{points}</span>
        <MasteryGemIcon className="home-header__gem-icon" />
        <span className="home-header__words-discovered-count">{wordsDiscovered}</span>
      </button>

      <OverflowMenu currentPage="home" />

      {isStatsOpen && (
        <StatsDialog points={points} jlptLevels={jlptLevels} onClose={() => setIsStatsOpen(false)} />
      )}
    </header>
  );
}
