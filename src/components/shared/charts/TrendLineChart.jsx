import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { buildDailyCounts, formatDisplayDate, formatShortDate, ACCENT_BLUE, GRID_LINE, AXIS_TEXT } from './activityChartUtils';
import './TrendLineChart.scss';

function buildTrendData(days, trendDays) {
  return buildDailyCounts(days, trendDays).map((day) => ({ ...day, label: formatShortDate(day.date) }));
}

function TrendTooltip({ active, payload, formatTrendTooltip }) {
  if (!active || !payload?.length) return null;
  const { date, count } = payload[0].payload;
  return (
    <div className="trend-line-chart__tooltip">
      <div className="trend-line-chart__tooltip-date">{formatDisplayDate(date)}</div>
      <div className="trend-line-chart__tooltip-count">{formatTrendTooltip(count)}</div>
    </div>
  );
}

// A trailing line chart (Recharts) over the last `trendDays` days — the
// trend half of what used to be a single ActivityLineChart, split out so a
// caller like the admin dashboard can drive `trendDays` from its own state
// (a timeframe dropdown) rather than the device-width-driven default
// ActivityLineChart still uses for Effort. `days` is `[{ date:
// 'yyyy-MM-dd', count }, ...]`, zero days omitted (this component fills
// the gaps for the trailing window).
export function TrendLineChart({ days, isLoading, trendDays, title, formatTrendTooltip }) {
  const trendData = buildTrendData(days, trendDays);

  return (
    <div className="trend-line-chart">
      {title && <h2 className="trend-line-chart__title">{title}</h2>}
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
          <Tooltip
            content={<TrendTooltip formatTrendTooltip={formatTrendTooltip} />}
            cursor={{ stroke: GRID_LINE }}
            isAnimationActive={false}
          />
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
      <LoadingOverlay active={isLoading} />
    </div>
  );
}
