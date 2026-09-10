import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack } from 'react-icons/io5';
import { Button } from '@/components/shared/Button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { useUserContext } from '@/contexts/UserContext';
import { useLoginHistory } from '@/hooks/useLoginHistory';
import { cx } from '@/utils/cx';
import '@/pages/Profile/Page.scss';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Day and time are zero-padded (`2-digit`/`hour12: false`) rather than
// `numeric`/12-hour, so every login's timestamp takes up the same width and
// the list reads as a lined-up column instead of jittering per digit count.
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

// `device` is the raw user-agent device fingerprint from TANGO_ViewSessions
// (see the backend's tango/log.js) — 'Other' is what a typical desktop
// browser's user-agent reports (no specific device model to name), so it
// reads better relabeled here than shown verbatim. Null (no linked
// ViewSession — e.g. the login predates this feature, or never loaded a
// page) is left for the caller to skip entirely rather than showing
// "Unknown".
function formatDeviceLabel(device) {
  if (!device) return null;
  return device === 'Other' ? 'Desktop' : device;
}

// One label/value block inside a `.profile-card__body` — label stacked
// above its value (rather than side-by-side) so a long value never has to
// compete with the label for width on a narrow screen. That wrapper draws a
// divider above every direct child but the first (see Page.scss's
// `.profile-card__body > * + *`), so this and its sibling blocks never need
// their own last-child bookkeeping.
function ProfileRow({ label, children }) {
  return (
    <div className="profile-card__row">
      <span className="profile-card__row-label">{label}</span>
      {children}
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  // RequireAuth (App.jsx) never mounts this page until `user` is loaded and
  // non-null, so it's safe to read straight off it here without its own
  // loading branch.
  const { user } = useUserContext();
  const { logins, isLoading: isLoginsLoading } = useLoginHistory();

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <div className="profile-page">
        <header className="profile-page__header">
          <div className="profile-page__nav">
            <Link to="/home" className="profile-page__back" aria-label="Back to home">
              <IoArrowBack />
            </Link>
            <h1 className="profile-page__title">Profile</h1>
            <OverflowMenu currentPage="profile" className="profile-page__menu" />
          </div>
        </header>

        <div className="profile-page__content">
          <section className="profile-card">
            <h2 className="profile-card__title">Info</h2>

            <div className="profile-card__body">
              {/* No self-service editing — handles aren't user-settable, so
                  this row simply doesn't exist for an account that doesn't
                  have one, rather than showing an empty/placeholder value. */}
              {user.handle && (
                <ProfileRow label="Handle">
                  <span className="profile-card__row-value">@{user.handle}</span>
                </ProfileRow>
              )}

              <ProfileRow label="Joined">
                <span className="profile-card__row-value">{formatDate(user.createdAt)}</span>
              </ProfileRow>
            </div>
          </section>

          <section className="profile-card">
            <h2 className="profile-card__title">Security</h2>

            <div className="profile-card__body">
              <ProfileRow label="Email">
                <span className="profile-card__row-value">{user.email}</span>
              </ProfileRow>

              <ProfileRow label="Password">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/account/reset/request?email=${encodeURIComponent(user.email)}`)}
                >
                  Change Password
                </Button>
              </ProfileRow>

              <ProfileRow label="Recent logins">
                <div className="profile-card__logins">
                  {!isLoginsLoading && logins.length === 0 && (
                    <p className="profile-card__logins-empty">No login history yet.</p>
                  )}
                  <ul className="profile-card__logins-list">
                    {logins.map(({ loggedInAt, terminatedAt, device }, index) => {
                      const deviceLabel = formatDeviceLabel(device);
                      return (
                        <li key={index} className="profile-card__logins-item">
                          <div className="profile-card__logins-main">
                            <span
                              className={cx(
                                'profile-card__logins-dot',
                                !terminatedAt && 'profile-card__logins-dot--active'
                              )}
                              title={terminatedAt ? `Ended ${formatDateTime(terminatedAt)}` : 'Active'}
                            />
                            <span className="profile-card__logins-time">{formatDateTime(loggedInAt)}</span>
                            {deviceLabel && <span className="profile-card__logins-device">{deviceLabel}</span>}
                          </div>
                          {terminatedAt && (
                            <span className="profile-card__logins-status">Ended {formatDateTime(terminatedAt)}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <LoadingOverlay active={isLoginsLoading} />
                </div>
              </ProfileRow>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
