import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSubpageHeader } from '@/pages/Admin/AdminSubpageHeader';
import { ActivityCalendarChart } from '@/components/shared/charts/ActivityCalendarChart';
import { TrendLineChart } from '@/components/shared/charts/TrendLineChart';
import { useDailyActiveUsers } from '@/hooks/useDailyActiveUsers';
import { useDailyLessonsCompleted } from '@/hooks/useDailyLessonsCompleted';
import { useAdminOverallStats } from '@/hooks/useAdminOverallStats';
import '@/pages/Admin/Admin.scss';

// The activity calendar's window is fixed (not affected by the timeframe
// dropdown below it) — 9 months is enough to always show a full picture at
// a glance, independent of whatever shorter window the trend charts are
// currently zoomed to.
const CALENDAR_WINDOW_DAYS = 270;
const CALENDAR_WINDOW_LABEL = 'last 9 months';

// The trend charts' shared timeframe — picking one here re-renders both
// "Daily Active Users" and "Daily Lessons Completed" below at once, since
// they're meant to be compared over the same window rather than each
// scrolled independently.
const TIMEFRAME_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 14, label: 'Last 14 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 3 months' },
  { days: 180, label: 'Last 6 months' },
];
const DEFAULT_TREND_DAYS = 30;

function formatActiveUsersCalendarTooltip(count, dateLabel) {
  if (!count) return `No active users on ${dateLabel}`;
  return `${count} active user${count === 1 ? '' : 's'} on ${dateLabel}`;
}

// Summing the calendar's own per-day counts across the whole window isn't
// a distinct-user count over that window — a user active on 5 different
// days counts 5 times — so this is worded as "active user-days" rather
// than implying it's deduped across the whole period the way a single
// day's own count is.
function formatActiveUsersTotalLabel(total, windowLabel) {
  return `${total} active user-day${total === 1 ? '' : 's'} in the ${windowLabel}`;
}

function formatActiveUsersTrendTooltip(count) {
  return `${count} active user${count === 1 ? '' : 's'}`;
}

function formatLessonsTrendTooltip(count) {
  return `${count} lesson${count === 1 ? '' : 's'} completed`;
}

const PLAN_LABELS = [
  { key: 'FREE', label: 'Free' },
  { key: 'BETA', label: 'Beta' },
  { key: 'PRO', label: 'Pro' },
];

// All-time (not affected by the timeframe dropdown below it) — sits between
// the activity calendar and the dropdown, same "lifetime totals first, then
// a zoomable trend" ordering as most analytics dashboards.
function OverallStats({ stats, isLoading }) {
  const { totalUsers, usersByPlan, totalWordsDiscovered, totalLessonsCompleted } = stats;

  return (
    <div className="admin-page__stats">
      <div className="admin-page__stat">
        <div className="admin-page__stat-value">{isLoading ? '—' : totalUsers.toLocaleString()}</div>
        <div className="admin-page__stat-label">Total Users</div>
        <div className="admin-page__stat-breakdown">
          {PLAN_LABELS.map(({ key, label }) => (
            <span key={key} className="admin-page__stat-breakdown-item">
              {label}: {isLoading ? '—' : usersByPlan[key].toLocaleString()}
            </span>
          ))}
        </div>
      </div>
      <div className="admin-page__stat">
        <div className="admin-page__stat-value">{isLoading ? '—' : totalWordsDiscovered.toLocaleString()}</div>
        <div className="admin-page__stat-label">Total Words Discovered</div>
      </div>
      <div className="admin-page__stat">
        <div className="admin-page__stat-value">{isLoading ? '—' : totalLessonsCompleted.toLocaleString()}</div>
        <div className="admin-page__stat-label">Total Lessons Completed</div>
      </div>
    </div>
  );
}

// A plain native <select> rather than the app's usual custom trigger+popup
// (FilterButton/SortButton, Dashboard's own ModeDropdown) — this is an
// internal admin control with no design requirements yet ("lorem ipsum for
// now"), and a native select gets a working, accessible dropdown for free.
function TimeframeDropdown({ trendDays, setTrendDays }) {
  return (
    <label className="admin-page__timeframe">
      Timeframe
      <select
        className="admin-page__timeframe-select"
        value={trendDays}
        onChange={(event) => setTrendDays(Number(event.target.value))}
      >
        {TIMEFRAME_OPTIONS.map(({ days, label }) => (
          <option key={days} value={days}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminDashboardPage() {
  const { days: activeUserDays, isLoading: isLoadingActiveUsers } = useDailyActiveUsers();
  const { days: lessonDays, isLoading: isLoadingLessons } = useDailyLessonsCompleted();
  const { stats, isLoading: isLoadingStats } = useAdminOverallStats();
  const [trendDays, setTrendDays] = useState(DEFAULT_TREND_DAYS);

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Admin Dashboard</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <AdminSubpageHeader title="Dashboard" />
        <div className="admin-page__content">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>

          <section className="admin-page__section">
            <h2 className="admin-page__section-title">Activity</h2>
            <ActivityCalendarChart
              days={activeUserDays}
              isLoading={isLoadingActiveUsers}
              windowDays={CALENDAR_WINDOW_DAYS}
              windowLabel={CALENDAR_WINDOW_LABEL}
              formatCalendarTooltip={formatActiveUsersCalendarTooltip}
              formatTotalLabel={formatActiveUsersTotalLabel}
            />

            <OverallStats stats={stats} isLoading={isLoadingStats} />

            <TimeframeDropdown trendDays={trendDays} setTrendDays={setTrendDays} />

            <div className="admin-page__trend-charts">
              <TrendLineChart
                days={activeUserDays}
                isLoading={isLoadingActiveUsers}
                trendDays={trendDays}
                title="Daily Active Users"
                formatTrendTooltip={formatActiveUsersTrendTooltip}
              />
              <TrendLineChart
                days={lessonDays}
                isLoading={isLoadingLessons}
                trendDays={trendDays}
                title="Daily Lessons Completed"
                formatTrendTooltip={formatLessonsTrendTooltip}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
