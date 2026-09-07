import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { IconButton } from '@/components/shared/IconButton';
import './OverflowMenu.scss';

// Every page this menu can link to, keyed by the page it represents so
// `currentPage` can mark that page's own entry active.
const MENU_ITEMS = [
  { key: 'home', label: 'Home', to: '/home' },
  { key: 'overview', label: 'Words', to: '/words' },
  { key: 'practice', label: 'Practice', to: '/practice' },
  { key: 'effort', label: 'Effort', to: '/effort' },
  { key: 'achievements', label: 'Achievements', to: '/achievements' },
];

// Ellipsis-triggered navigation menu shared by the sticky headers on the
// home, practice, overview, effort, and achievements pages. `currentPage`
// is one of MENU_ITEMS' keys (or omitted) — always shows every entry, so the list
// never shifts between pages, but highlights the current one and just
// closes the menu (rather than navigating) when it's clicked.
export function OverflowMenu({ currentPage, className }) {
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
    <div className={cx('shared-overflow-menu', className)} ref={menuRef}>
      <IconButton label="Menu" size="sm" onClick={() => setIsMenuOpen((open) => !open)}>
        <IoEllipsisHorizontal />
      </IconButton>

      {isMenuOpen && (
        <ul className="shared-overflow-menu__list" role="menu">
          {MENU_ITEMS.map(({ key, label, to }) => {
            const isCurrent = key === currentPage;
            const itemClassName = cx(
              'shared-overflow-menu__item',
              isCurrent && 'shared-overflow-menu__item--active'
            );

            return (
              <li key={key} role="none">
                {isCurrent ? (
                  <button
                    type="button"
                    className={itemClassName}
                    role="menuitem"
                    aria-current="page"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </button>
                ) : (
                  <Link className={itemClassName} role="menuitem" to={to} onClick={() => setIsMenuOpen(false)}>
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
