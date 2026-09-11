import { ActivityCalendar } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useEffort } from '@/hooks/useEffort';
import { useViewportWidth } from '@/hooks/useViewportWidth';
import '@/pages/Effort/Page.scss';

// Same mobile breakpoint used elsewhere in the app (e.g.
// SpellingTiles.jsx) — @media (max-width: 768px) in Page.scss.
const MOBILE_BREAKPOINT = 768;

// The backend's getEffort always returns up to a full year of days (see
// tango/quiz.js's EFFORT_WINDOW_DAYS) regardless of viewport — narrowing to
// fewer trailing days on mobile is purely a matter of using less of that
// same response, no separate request.
const DESKTOP_WINDOW_DAYS = 365;
const MOBILE_WINDOW_DAYS = 180; // ~6 months
const DESKTOP_TREND_DAYS = 14;
const MOBILE_TREND_DAYS = 7;
const MAX_LEVEL = 4;

// Same blue as the rest of the app's accent color (--color-accent-primary)
// — hardcoded rather than referencing the CSS variable since both
// react-activity-calendar's theme and Recharts' SVG props expect a literal
// color, not something that resolves var() the way an inline style would.
const ACCENT_BLUE = '#60a5fa';
const GRID_LINE = '#374151'; // --color-border-primary
const AXIS_TEXT = '#9ca3af'; // --color-text-muted

// Zero-activity cells fade toward the app's own tertiary background, full
// cells reach the primary accent blue — react-activity-calendar
// interpolates the levels in between from just these two colors. Single
// entry since the app only ever renders in dark mode (see App.scss).
const CALENDAR_THEME = {
  dark: ['#3d3d3d', ACCENT_BLUE],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Every day in the rolling window, oldest first. react-activity-calendar
// only strictly needs the first/last day present to know where the grid
// starts and ends (everything else defaults to zero activity), but
// generating the full range up front turns "merge in the fetched counts"
// into a plain lookup below instead of a sparse-array edge case.
function buildDateRange(numDays) {
  const dates = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

// Buckets a day's raw lesson count into one of react-activity-calendar's
// activity levels (0-MAX_LEVEL), scaled relative to the busiest day in the
// window — so the color scale always reflects the user's own range rather
// than some arbitrary fixed lesson count. Any day with at least one
// completed lesson gets at least level 1, so a light day is still visibly
// distinct from a day with none.
function levelFor(count, maxCount) {
  if (!count || !maxCount) return 0;
  return Math.max(1, Math.min(MAX_LEVEL, Math.ceil((count / maxCount) * MAX_LEVEL)));
}

// Re-parses a 'yyyy-MM-dd' string as local-midnight (not UTC-midnight, which
// `new Date('yyyy-MM-dd')` would give and could then display as the wrong
// day once toLocaleDateString renders it back in the browser's own
// timezone) — matches how buildDateRange above generated the string in the
// first place.
function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function tooltipTextFor(activity) {
  const dateLabel = formatDisplayDate(activity.date);
  if (!activity.count) return `No lessons on ${dateLabel}`;
  return `${activity.count} lesson${activity.count === 1 ? '' : 's'} on ${dateLabel}`;
}

// Every day in the last `numDays`, oldest first, with zero-filled gaps —
// the shared shape both the calendar (which adds a `level` on top) and the
// trend chart (which adds a display `label`) build from.
function buildDailyCounts(days, numDays) {
  const countByDate = Object.fromEntries(days.map((day) => [day.date, day.count]));
  return buildDateRange(numDays).map((date) => ({ date, count: countByDate[date] || 0 }));
}

function buildCalendarData(days, windowDays) {
  const dailyCounts = buildDailyCounts(days, windowDays);
  const maxCount = dailyCounts.reduce((max, day) => Math.max(max, day.count), 0);
  return dailyCounts.map((day) => ({ ...day, level: levelFor(day.count, maxCount) }));
}

function formatShortDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildTrendData(days, trendDays) {
  return buildDailyCounts(days, trendDays).map((day) => ({ ...day, label: formatShortDate(day.date) }));
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { date, count } = payload[0].payload;
  return (
    <div className="effort-page__trend-tooltip">
      <div className="effort-page__trend-tooltip-date">{formatDisplayDate(date)}</div>
      <div className="effort-page__trend-tooltip-count">
        {count} lesson{count === 1 ? '' : 's'}
      </div>
    </div>
  );
}

// Self-contained: fetches its own data via useEffort, so it can be dropped
// into the standalone /effort page or the combined /overview page's Effort
// mode (see pages/Dashboard) without either one needing to know about the
// fetch.
export function EffortCharts() {
  const { days, isLoading } = useEffort();
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;

  const windowDays = isMobile ? MOBILE_WINDOW_DAYS : DESKTOP_WINDOW_DAYS;
  const trendDays = isMobile ? MOBILE_TREND_DAYS : DESKTOP_TREND_DAYS;

  const calendarData = buildCalendarData(days, windowDays);
  const trendData = buildTrendData(days, trendDays);
  const totalLessons = calendarData.reduce((sum, day) => sum + day.count, 0);
  const windowLabel = isMobile ? 'last 6 months' : 'last year';

  return (
    <div className="effort-page__content">
      <div className="effort-page__calendar-wrap">
        <ActivityCalendar
          data={calendarData}
          theme={CALENDAR_THEME}
          colorScheme="dark"
          maxLevel={MAX_LEVEL}
          blockSize={11}
          blockMargin={4}
          blockRadius={3}
          fontSize={13}
          labels={{
            totalCount: `${totalLessons} lesson${totalLessons === 1 ? '' : 's'} completed in the ${windowLabel}`,
          }}
          tooltips={{
            activity: { text: tooltipTextFor },
          }}
        />
      </div>

      <div className="effort-page__trend">
        <h2 className="effort-page__trend-title">Last {trendDays} Days</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_LINE} />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={{ stroke: GRID_LINE }}
              tickLine={false}
            />
            <YAxis
              domain={['dataMin', 'dataMax']}
              allowDecimals={false}
              width={28}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            {/* Recharts animates the tooltip sliding from its old position to its
                new one by default (400ms), which reads as sluggish/"drifty" when
                moving quickly between points — isAnimationActive={false} snaps it
                straight to the hovered point instead. */}
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: GRID_LINE }} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={ACCENT_BLUE}
              strokeWidth={2}
              dot={{ r: 4, fill: ACCENT_BLUE, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <LoadingOverlay active={isLoading} />
    </div>
  );
}
