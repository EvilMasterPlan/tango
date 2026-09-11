import { ActivityLineChart } from '@/components/shared/charts/ActivityLineChart';
import { useEffort } from '@/hooks/useEffort';
import '@/pages/Effort/Page.scss';

function formatCalendarTooltip(count, dateLabel) {
  if (!count) return `No lessons on ${dateLabel}`;
  return `${count} lesson${count === 1 ? '' : 's'} on ${dateLabel}`;
}

function formatTotalLabel(total, windowLabel) {
  return `${total} lesson${total === 1 ? '' : 's'} completed in the ${windowLabel}`;
}

function formatTrendTooltip(count) {
  return `${count} lesson${count === 1 ? '' : 's'}`;
}

// Self-contained: fetches its own data via useEffort, so it can be dropped
// into the standalone /effort page or the combined /overview page's Effort
// mode (see pages/Dashboard) without either one needing to know about the
// fetch. The calendar/trend chart plumbing itself lives in the shared
// ActivityLineChart (which the admin dashboard's charts are also built
// from, just composed separately — see Admin/Dashboard/Page.jsx) — this
// just supplies the per-user "lessons completed" wording.
export function EffortCharts() {
  const { days, isLoading } = useEffort();

  return (
    <div className="effort-page__content">
      <ActivityLineChart
        days={days}
        isLoading={isLoading}
        formatCalendarTooltip={formatCalendarTooltip}
        formatTotalLabel={formatTotalLabel}
        formatTrendTooltip={formatTrendTooltip}
      />
    </div>
  );
}
