import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdminSubpageHeader } from '@/pages/Admin/AdminSubpageHeader';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useAdminSecurityStats } from '@/hooks/useAdminSecurityStats';
import '@/pages/Admin/Admin.scss';

const WINDOW_LABEL = 'last 30 days';

// Shared shape for all three ranked tables below — `rows` already comes
// back from the API sorted by hitCount descending, so this just adds the
// 1-based rank column and renders whatever `renderLabel` gives it for the
// row-specific cell.
function RankedTable({ rows, labelHeader, renderLabel, emptyMessage }) {
  if (rows.length === 0) {
    return <p className="admin-page__empty">{emptyMessage}</p>;
  }

  return (
    <div className="admin-page__table-wrap">
      <table className="admin-page__table">
        <thead>
          <tr>
            <th className="admin-page__table-numeric">#</th>
            <th>{labelHeader}</th>
            <th className="admin-page__table-numeric">404s</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="admin-page__table-numeric">{index + 1}</td>
              <td>{renderLabel(row)}</td>
              <td className="admin-page__table-numeric">{row.hitCount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminSecurityPage() {
  const { topNotFoundPaths, topNotFoundUsers, topNotFoundIPs, isLoading, error } = useAdminSecurityStats();

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Admin Security</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <AdminSubpageHeader title="Security" />
        <div className="admin-page__content">
          {error && <p className="admin-page__empty">Something went wrong loading security stats.</p>}

          {!error && (
            <div className="admin-page__detail">
              <section className="admin-page__section">
                <h2 className="admin-page__section-title">Most Frequent 404s</h2>
                <p className="admin-page__section-subtitle">By URL, ignoring query strings — {WINDOW_LABEL}.</p>
                <RankedTable
                  rows={topNotFoundPaths}
                  labelHeader="Path"
                  renderLabel={(row) => row.path}
                  emptyMessage="No 404s logged in the last 30 days."
                />
              </section>

              <section className="admin-page__section">
                <h2 className="admin-page__section-title">Top Signed-In Users by 404s</h2>
                <p className="admin-page__section-subtitle">{WINDOW_LABEL}.</p>
                <RankedTable
                  rows={topNotFoundUsers}
                  labelHeader="User"
                  renderLabel={(row) => <Link to={`/kansatsu/spotlight/${row.userID}`}>{row.email}</Link>}
                  emptyMessage="No signed-in 404s logged in the last 30 days."
                />
              </section>

              <section className="admin-page__section">
                <h2 className="admin-page__section-title">Top Signed-Out IPs by 404s</h2>
                <p className="admin-page__section-subtitle">{WINDOW_LABEL}.</p>
                <RankedTable
                  rows={topNotFoundIPs}
                  labelHeader="IP Address"
                  renderLabel={(row) => row.address}
                  emptyMessage="No signed-out 404s logged in the last 30 days."
                />
              </section>

              <LoadingOverlay active={isLoading} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
