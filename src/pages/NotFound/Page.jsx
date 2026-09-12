import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEventLog } from '@/hooks/useEventLog';
import '@/pages/NotFound/Page.scss';

// Catch-all for any path that doesn't match one of App.jsx's own routes
// (see its trailing `path="*"` route). The app-root PageViewLogger already
// logs a generic 'view' row for this same pathname on its own — this adds
// its own explicit 'not_found' EventType on top of that, so a real 404 is
// its own queryable thing rather than something that'd otherwise have to
// be inferred later by matching Path against the app's known route list.
export function NotFoundPage() {
  useEventLog('not_found');

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Page Not Found</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="not-found-page">
        <div className="not-found-page__code">無い</div>
        <p className="not-found-page__message">This page doesn't exist.</p>
        <Link to="/" className="not-found-page__home-link">
          Go Home
        </Link>
      </div>
    </>
  );
}
