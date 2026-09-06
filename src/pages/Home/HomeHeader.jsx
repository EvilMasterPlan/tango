import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { CoinIcon } from '@/components/quiz/summary/CoinIcon';
import { IconButton } from '@/components/shared/IconButton';
import './HomeHeader.scss';

const MENU_ITEMS = [
  { label: 'Debug', to: '/debug/radar' },
  { label: 'Words', to: '/overview' },
  { label: 'Practice', to: '/practice' },
];

// Sticky header for the home page. `points` comes from the parent page
// rather than fetched here, so its loading state can be combined with the
// rest of the page's.
export function HomeHeader({ points }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Closes on an outside click/tap or Escape — the two standard ways to
  // dismiss a popup menu without picking an option.
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="home-header">
      <div className="home-header__coins">
        <CoinIcon />
        <span className="home-header__coin-count">{points}</span>
      </div>

      <div className="home-header__menu" ref={menuRef}>
        <IconButton label="Menu" size="sm" onClick={() => setIsMenuOpen((open) => !open)}>
          <IoEllipsisHorizontal />
        </IconButton>

        {isMenuOpen && (
          <ul className="home-header__menu-list" role="menu">
            {MENU_ITEMS.map(({ label, to }) => (
              <li key={to} role="none">
                <Link className="home-header__menu-item" role="menuitem" to={to} onClick={() => setIsMenuOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
