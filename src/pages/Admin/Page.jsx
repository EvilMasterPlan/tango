import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack } from 'react-icons/io5';
import '@/pages/Admin/Admin.scss';

// Every /kansatsu/* subpage worth linking from the hub — each is its own
// route (see App.jsx), gated by the same RequireAuth + RequireAdmin as the
// hub itself, so linking to one from here doesn't skip any of that.
// /kansatsu/radar (Admin/Radar) is deliberately left off this list — the
// route itself still exists and still works, it's just not surfaced here.
const ADMIN_PAGES = [
  { to: '/kansatsu/dashboard', label: 'Dashboard' },
  { to: '/kansatsu/spotlight', label: 'Spotlight' },
  { to: '/kansatsu/security', label: 'Security' },
  { to: '/kansatsu/sharp-edges', label: 'Sharp Edges' },
];

// Reached only via its own hard-to-guess path (see App.jsx) plus
// RequireAuth + RequireAdmin — not linked from anywhere in the app's own
// nav (OverflowMenu etc. deliberately don't know about it), so no header
// menu here either.
export function AdminPage() {
  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <header className="admin-page__header">
          <Link to="/home" className="admin-page__back" aria-label="Back to home">
            <IoArrowBack />
          </Link>
          <h1 className="admin-page__title">Admin</h1>
        </header>

        <div className="admin-page__content">
          <nav className="admin-page__links" aria-label="Admin subpages">
            {ADMIN_PAGES.map(({ to, label }) => (
              <Link key={to} to={to} className="admin-page__link">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
