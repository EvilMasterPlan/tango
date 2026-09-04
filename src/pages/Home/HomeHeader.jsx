import { IoEllipsisHorizontal } from 'react-icons/io5';
import { CoinIcon } from '@/components/quiz/summary/CoinIcon';
import { IconButton } from '@/components/shared/IconButton';
import './HomeHeader.scss';

// Sticky header for the home page. The "..." button is non-functional for
// now — it'll become a context menu later. `points` comes from the parent
// page (see Page.jsx) rather than fetched here, so its loading state can be
// combined with the rest of the page's — see useOverallStats/LoadingOverlay
// there.
export function HomeHeader({ points }) {
  return (
    <header className="home-header">
      <div className="home-header__coins">
        <CoinIcon />
        <span className="home-header__coin-count">{points}</span>
      </div>

      <IconButton label="Menu" size="sm">
        <IoEllipsisHorizontal />
      </IconButton>
    </header>
  );
}
