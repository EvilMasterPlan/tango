import { CoinIcon } from '@/components/quiz/summary/CoinIcon';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import './HomeHeader.scss';

// Sticky header for the home page. `points` comes from the parent page
// rather than fetched here, so its loading state can be combined with the
// rest of the page's.
export function HomeHeader({ points }) {
  return (
    <header className="home-header">
      <div className="home-header__coins">
        <CoinIcon />
        <span className="home-header__coin-count">{points}</span>
      </div>

      <OverflowMenu currentPage="home" />
    </header>
  );
}
