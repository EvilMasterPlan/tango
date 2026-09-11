// Shared by ActivityCalendarChart and TrendLineChart (and, through those,
// ActivityLineChart, which composes the two for Effort's own single-window
// chart) — the date-range/bucketing math both need, kept in one place so
// the calendar and the trend line always agree on what a "day" means for a
// given `days` API response.

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Every day in the rolling window, oldest first. Callers only strictly need
// the first/last day present to know where a chart starts and ends
// (everything else defaults to zero activity), but generating the full
// range up front turns "merge in the fetched counts" into a plain lookup
// below instead of a sparse-array edge case.
export function buildDateRange(numDays) {
  const dates = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDateKey(date));
  }
  return dates;
}

// Every day in the last `numDays`, oldest first, with zero-filled gaps —
// the shared shape both the calendar (which adds a `level` on top) and the
// trend chart (which adds a display `label`) build from. `days` is the raw
// API response, `[{ date: 'yyyy-MM-dd', count }, ...]` with zero-count days
// simply omitted.
export function buildDailyCounts(days, numDays) {
  const countByDate = Object.fromEntries(days.map((day) => [day.date, day.count]));
  return buildDateRange(numDays).map((date) => ({ date, count: countByDate[date] || 0 }));
}

// Re-parses a 'yyyy-MM-dd' string as local-midnight (not UTC-midnight, which
// `new Date('yyyy-MM-dd')` would give and could then display as the wrong
// day once toLocaleDateString renders it back in the browser's own
// timezone) — matches how buildDateRange above generated the string in the
// first place.
export function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Same accent-blue/grid-line/axis-text literal-color reasoning as the rest
// of this chart family — react-activity-calendar's theme and Recharts' SVG
// props both expect a literal color, not something that resolves var() the
// way an inline style would.
export const ACCENT_BLUE = '#60a5fa'; // --color-accent-primary
export const GRID_LINE = '#374151'; // --color-border-primary
export const AXIS_TEXT = '#9ca3af'; // --color-text-muted
