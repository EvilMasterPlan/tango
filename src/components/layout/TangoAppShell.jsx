import { RiHomeLine, RiMenu3Line, RiVipDiamondLine } from 'react-icons/ri';
import { LuPickaxe } from 'react-icons/lu';
import '@/components/layout/TangoAppShell.scss';

export function TangoAppShell({ children }) {
  return (
    <div className="tango-shell">
      <header className="tango-shell-header">
        <span className="tango-shell-title">Tanuki Tango</span>
        <button type="button" className="tango-shell-menu-button" aria-label="Open menu">
          <RiMenu3Line className="tango-shell-menu-icon" aria-hidden />
        </button>
      </header>
      <main className="tango-shell-main">{children}</main>
      <footer className="tango-shell-footer" role="group" aria-label="Quick actions">
        <button type="button" className="tango-shell-footer-item" aria-label="Home">
          <RiHomeLine className="tango-shell-footer-icon" aria-hidden />
          <span>Home</span>
        </button>
        <button type="button" className="tango-shell-footer-item" aria-label="Gem">
          <RiVipDiamondLine className="tango-shell-footer-icon" aria-hidden />
          <span>Gem</span>
        </button>
        <button type="button" className="tango-shell-footer-item" aria-label="Pickaxe">
          <LuPickaxe className="tango-shell-footer-icon" aria-hidden />
          <span>Pickaxe</span>
        </button>
      </footer>
    </div>
  );
}
