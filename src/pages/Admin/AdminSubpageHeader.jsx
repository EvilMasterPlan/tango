import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import '@/pages/Admin/Admin.scss';

// Shared by every /kansatsu/* subpage (Radar, Dashboard, Spotlight, ...) —
// backs out to the hub itself by default, since a top-level subpage is only
// ever reached by way of the hub's own link buttons. `backTo` overrides
// that for a subpage reached by drilling down from another subpage instead
// (e.g. Spotlight's own user detail page backs out to /kansatsu/spotlight,
// not all the way back to the hub).
export function AdminSubpageHeader({ title, backTo = '/kansatsu' }) {
  return (
    <header className="admin-page__header">
      <Link to={backTo} className="admin-page__back" aria-label="Back">
        <IoArrowBack />
      </Link>
      <h1 className="admin-page__title">{title}</h1>
    </header>
  );
}
