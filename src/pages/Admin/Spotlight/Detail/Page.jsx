import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdminSubpageHeader } from '@/pages/Admin/AdminSubpageHeader';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useAdminUserDetails } from '@/hooks/useAdminUserDetails';
import '@/pages/Admin/Admin.scss';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Zero-padded (`2-digit`/`hour12: false`) rather than `numeric`/12-hour —
// same reasoning as Profile/Page.jsx's own formatDateTime — so every row's
// timestamp takes up the same width and the table reads as a lined-up
// column instead of jittering per digit count.
function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Path + query string as one cell — Search is just the tail end of the same
// URL Path names, not an independently interesting column of its own.
function formatUrl(path, search) {
  if (!path) return '—';
  return search ? `${path}${search}` : path;
}

export function AdminSpotlightDetailPage() {
  const { userID } = useParams();
  const { user, stats, eventLogs, isLoading, error } = useAdminUserDetails(userID);

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Admin Spotlight</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <AdminSubpageHeader title="Spotlight" backTo="/kansatsu/spotlight" />
        <div className="admin-page__content">
          {error && <p className="admin-page__empty">Something went wrong loading this user.</p>}

          {!error && (
            <div className="admin-page__detail">
              {user && (
                <>
                  <div className="admin-page__user-detail-header">
                    <div className="admin-page__user-detail-email">{user.email}</div>
                    <span className="admin-page__user-card-plan">{user.plan || 'FREE'}</span>
                  </div>
                  {user.handle && <div className="admin-page__user-card-handle">@{user.handle}</div>}
                  <div className="admin-page__user-card-id">{user.userID}</div>
                  <div className="admin-page__user-card-joined">Joined {formatDate(user.createdAt)}</div>

                  <div className="admin-page__stats">
                    <div className="admin-page__stat">
                      <div className="admin-page__stat-value">{stats.wordsDiscovered.toLocaleString()}</div>
                      <div className="admin-page__stat-label">Words Discovered</div>
                    </div>
                    <div className="admin-page__stat">
                      <div className="admin-page__stat-value">{stats.lessonsCompleted.toLocaleString()}</div>
                      <div className="admin-page__stat-label">Lessons Completed</div>
                    </div>
                  </div>

                  <section className="admin-page__section">
                    <h2 className="admin-page__section-title">Event Log</h2>
                    {eventLogs.length === 0 ? (
                      <p className="admin-page__empty">No events logged for this user.</p>
                    ) : (
                      <div className="admin-page__table-wrap">
                        <table className="admin-page__table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Type</th>
                              <th>Page</th>
                              <th>URL</th>
                              <th>Referer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventLogs.map((event) => (
                              <tr key={event.eventID}>
                                <td>{formatDateTime(event.recordedAt)}</td>
                                <td>{event.eventType}</td>
                                <td>{event.page || '—'}</td>
                                <td>{formatUrl(event.path, event.search)}</td>
                                <td>{event.referer || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </>
              )}

              <LoadingOverlay active={isLoading} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
