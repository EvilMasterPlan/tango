import { ActivityCalendar } from 'react-activity-calendar';
import 'react-activity-calendar/tooltips.css';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { buildDailyCounts, formatDisplayDate, ACCENT_BLUE } from './activityChartUtils';
import './ActivityCalendarChart.scss';

const MAX_LEVEL = 4;

// Zero-activity cells fade toward the app's own tertiary background, full
// cells reach the primary accent blue — react-activity-calendar
// interpolates the levels in between from just these two colors. Single
// entry since the app only ever renders in dark mode (see App.scss).
const CALENDAR_THEME = {
  dark: ['#3d3d3d', ACCENT_BLUE],
};

// Buckets a day's raw count into one of react-activity-calendar's activity
// levels (0-MAX_LEVEL), scaled relative to the busiest day in the window —
// so the color scale always reflects this metric's own range rather than
// some arbitrary fixed count. Any day with at least one gets at least
// level 1, so a light day is still visibly distinct from a day with none.
function levelFor(count, maxCount) {
  if (!count || !maxCount) return 0;
  return Math.max(1, Math.min(MAX_LEVEL, Math.ceil((count / maxCount) * MAX_LEVEL)));
}

function buildCalendarData(days, windowDays) {
  const dailyCounts = buildDailyCounts(days, windowDays);
  const maxCount = dailyCounts.reduce((max, day) => Math.max(max, day.count), 0);
  return dailyCounts.map((day) => ({ ...day, level: levelFor(day.count, maxCount) }));
}

// A day-by-day contribution-style calendar (react-activity-calendar) — the
// calendar half of what used to be a single ActivityLineChart, split out so
// the admin dashboard can pair one fixed-window calendar with a
// dropdown-driven TrendLineChart (or two) below it, while Effort's own
// single fixed-window chart still gets both bundled via ActivityLineChart.
// `days` is `[{ date: 'yyyy-MM-dd', count }, ...]`, zero days omitted (this
// component fills the gaps).
export function ActivityCalendarChart({ days, isLoading, windowDays, windowLabel, formatCalendarTooltip, formatTotalLabel }) {
  const calendarData = buildCalendarData(days, windowDays);
  const total = calendarData.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="activity-calendar-chart">
      <div className="activity-calendar-chart__wrap">
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
            totalCount: formatTotalLabel(total, windowLabel),
          }}
          tooltips={{
            activity: { text: (activity) => formatCalendarTooltip(activity.count, formatDisplayDate(activity.date)) },
          }}
        />
      </div>
      <LoadingOverlay active={isLoading} />
    </div>
  );
}
