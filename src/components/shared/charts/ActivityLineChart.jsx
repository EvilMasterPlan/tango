import { useViewportWidth } from '@/hooks/useViewportWidth';
import { ActivityCalendarChart } from './ActivityCalendarChart';
import { TrendLineChart } from './TrendLineChart';
import './ActivityLineChart.scss';

// Same mobile breakpoint used elsewhere in the app (e.g.
// SpellingTiles.jsx) — @media (max-width: 768px) in the two charts' own
// scss files.
const MOBILE_BREAKPOINT = 768;

const DESKTOP_WINDOW_DAYS = 365;
const MOBILE_WINDOW_DAYS = 180; // ~6 months
const DESKTOP_TREND_DAYS = 14;
const MOBILE_TREND_DAYS = 7;

// Effort's own single fixed-window chart (calendar + trend line, sized down
// on mobile) — composes ActivityCalendarChart + TrendLineChart, which the
// admin dashboard instead uses separately (one calendar, a shared timeframe
// dropdown, and two trend charts driven by it — see Admin/Dashboard/
// Page.jsx) since it needs the trend window to be user-selectable rather
// than device-width-driven.
export function ActivityLineChart({ days, isLoading, trendTitle, formatCalendarTooltip, formatTotalLabel, formatTrendTooltip }) {
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;

  const windowDays = isMobile ? MOBILE_WINDOW_DAYS : DESKTOP_WINDOW_DAYS;
  const trendDays = isMobile ? MOBILE_TREND_DAYS : DESKTOP_TREND_DAYS;
  const windowLabel = isMobile ? 'last 6 months' : 'last year';

  return (
    <>
      <ActivityCalendarChart
        days={days}
        isLoading={isLoading}
        windowDays={windowDays}
        windowLabel={windowLabel}
        formatCalendarTooltip={formatCalendarTooltip}
        formatTotalLabel={formatTotalLabel}
      />
      <div className="activity-line-chart__trend">
        <TrendLineChart
          days={days}
          trendDays={trendDays}
          title={trendTitle || `Last ${trendDays} Days`}
          formatTrendTooltip={formatTrendTooltip}
        />
      </div>
    </>
  );
}
