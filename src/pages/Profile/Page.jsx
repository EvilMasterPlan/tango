import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack } from 'react-icons/io5';
import { Button } from '@/components/shared/Button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { useUserContext } from '@/contexts/UserContext';
import { useActivityHistory } from '@/hooks/useActivityHistory';
import { FREE_JLPT_LEVEL } from '@/utils/planAccess';
import '@/pages/Profile/Page.scss';

// Keyed by TANGO_Users.Plan ('FREE'/'BETA'/'PRO' — see planAccess.js). An
// unrecognized/missing plan falls back to FREE below, same as
// hasFullAccess's own no-access default.
const PLAN_DETAILS = {
  FREE: {
    label: 'Free',
    description: `Free forever, but you can only practice ${FREE_JLPT_LEVEL} words.`,
  },
  BETA: {
    label: 'Beta',
    description: "You're on a special Beta tester plan which gives you unlimited access for free. You'll be converted to a Free plan when Tango Tanuki launches.",
  },
  PRO: {
    label: 'Pro',
    description: 'You get unlimited access to all words.',
  },
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Day and time are zero-padded (`2-digit`/`hour12: false`) rather than
// `numeric`/12-hour, so every event's timestamp takes up the same width and
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
  const { user, logout } = useUserContext();
  const { activity, isLoading: isActivityLoading } = useActivityHistory();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const planKey = PLAN_DETAILS[user.plan] ? user.plan : 'FREE';
  const planDetails = PLAN_DETAILS[planKey];

  // logout() (UserContext) already clears `user` on its own, which would
  // eventually bounce this page via RequireAuth's redirect — but that one
  // lands on /account/start with a next= pointing right back at /profile,
  // meant for an unauthenticated visit hitting a protected route, not for
  // walking away from one on purpose. Navigating to /account/login directly
  // here skips that detour.
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      navigate('/account/login');
    } finally {
      setIsSigningOut(false);
    }
  };

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

              <ProfileRow label="Plan">
                <div className="profile-plan-card">
                  <div className="profile-plan-card__name">{planDetails.label}</div>
                  <p className="profile-plan-card__description">{planDetails.description}</p>
                  {/* PRO and BETA both grant full access (see planAccess.js), but only
                      PRO is an actual paid subscription — BETA is a comped account with
                      nothing to cancel, so it gets neither button. */}
                  {planKey === 'FREE' && (
                    <div className="profile-plan-card__action">
                      <Button variant="primary" disabled>
                        Upgrade
                      </Button>
                      <span className="profile-plan-card__note">Coming soon</span>
                    </div>
                  )}
                  {planKey === 'PRO' && (
                    <div className="profile-plan-card__action">
                      <Button variant="secondary" disabled>
                        Cancel
                      </Button>
                      <span className="profile-plan-card__note">Coming soon</span>
                    </div>
                  )}
                </div>
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

              <ProfileRow label="Recent Activity">
                <div className="profile-card__activity">
                  {!isActivityLoading && activity.length === 0 && (
                    <p className="profile-card__activity-empty">No recent activity.</p>
                  )}
                  <table className="profile-card__activity-table">
                    <tbody>
                      {activity.map(({ at, type }, index) => (
                        <tr key={index} className="profile-card__activity-row">
                          <td className="profile-card__activity-time">
                            <span className="profile-card__activity-marker" aria-hidden="true" />
                            {formatDateTime(at)}
                          </td>
                          <td className="profile-card__activity-type">{type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <LoadingOverlay active={isActivityLoading} />
                </div>
              </ProfileRow>

              <Button variant="secondary" onClick={handleSignOut} disabled={isSigningOut}>
                Sign Out
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
