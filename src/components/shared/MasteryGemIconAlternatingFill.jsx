import './MasteryGemIcon.scss';

// A manual-review variant of MasteryGemIcon — same static, hardcoded
// 6-axis-hex approach (see that file's own comment for the general
// approach), except three axes (top, lower-right, lower-left) are filled
// all the way to the outer edge instead of stopping at the halfway guide
// ring, while the other three (upper-right, bottom, upper-left) stay at
// the original halfway fill. Not wired up anywhere permanent — swapped in
// at one call site (see HomeHeader.jsx) purely so the two can be compared
// side by side before deciding whether this reads better than the uniform
// half-fill.
//
// Geometry recomputed from GemChart.jsx's own axisAngle/axisXY/facetSlices/
// facetFill formulas (not hand-derived from the uniform case) with a
// per-axis radius of RADIUS (18, index 0/2/4 — top/lower-right/lower-left)
// or the halfway radius (10.35, index 1/3/5 — upper-right/bottom/
// upper-left) — unequal radii shift each facet's seam point (and so its
// lighting midAngle) away from where it'd fall in MasteryGemIcon's uniform
// case, which is why FACET_LIGHTNESSES below isn't just that file's array
// reused. FLOOR_POINTS and the two guide rings (RING_POINTS/OUTLINE_POINTS)
// are unchanged from MasteryGemIcon — they're fixed reference levels, not
// affected by how far the fill itself reaches.

export const GEM_HUES = { red: 0, orange: 30, yellow: 50, green: 140, blue: 210 };

const FACET_LIGHTNESSES = [78, 64.6, 47, 37.7, 35.1, 37.7, 50.6, 64.6, 74.4, 85.2, 35.1, 39.8];
const FACET_POINTS = [
  '20,20 20,2 24.4817,8.4125',
  '20,20 24.4817,8.4125 28.9634,14.825',
  '20,20 28.9634,14.825 32.2759,21.9125',
  '20,20 32.2759,21.9125 35.5885,29',
  '20,20 35.5885,29 27.7942,29.675',
  '20,20 27.7942,29.675 20,30.35',
  '20,20 20,30.35 12.2058,29.675',
  '20,20 12.2058,29.675 4.4115,29',
  '20,20 4.4115,29 7.7241,21.9125',
  '20,20 7.7241,21.9125 11.0366,14.825',
  '20,20 11.0366,14.825 15.5183,8.4125',
  '20,20 15.5183,8.4125 20,2',
];

const FLOOR_POINTS = '20,17.3 22.338,18.65 22.338,21.35 20,22.7 17.662,21.35 17.662,18.65';
const RING_POINTS = '20,9.65 28.964,14.825 28.964,25.175 20,30.35 11.036,25.175 11.036,14.825';
const OUTLINE_POINTS = '20,2 35.588,11 35.588,29 20,38 4.412,29 4.412,11';
// The fill's own irregular boundary — alternates between OUTLINE_POINTS'
// radius (top/lower-right/lower-left) and RING_POINTS' radius (the other
// three), unlike MasteryGemIcon where the fill boundary always coincides
// exactly with RING_POINTS.
const FILL_OUTLINE_POINTS = '20,2 28.9634,14.825 35.5885,29 20,30.35 4.4115,29 11.0366,14.825';

export function MasteryGemIconAlternatingFill({ className, color = 'blue' }) {
  const hue = GEM_HUES[color] ?? GEM_HUES.blue;

  return (
    <svg
      className={['mastery-gem-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <polygon className="mastery-gem-icon__floor" points={FLOOR_POINTS} />
      <polygon className="mastery-gem-icon__ring" points={RING_POINTS} />
      <polygon className="mastery-gem-icon__outline" points={OUTLINE_POINTS} style={{ stroke: `hsl(${hue}, 75%, 60%)` }} />
      {FACET_POINTS.map((points, index) => (
        <polygon
          key={points}
          className="mastery-gem-icon__facet"
          style={{ fill: `hsl(${hue}, 75%, ${FACET_LIGHTNESSES[index]}%)` }}
          points={points}
        />
      ))}
      <polygon className="mastery-gem-icon__core" points={FLOOR_POINTS} style={{ fill: `hsl(${hue}, 75%, 60%)`, stroke: `hsl(${hue}, 75%, 60%)` }} />
      {/* Unlike MasteryGemIcon, this can't reuse RING_POINTS for the border
          — the fill no longer sits at a single uniform radius, so the
          crisp edge has to trace FILL_OUTLINE_POINTS' own irregular
          boundary instead. */}
      <polygon className="mastery-gem-icon__border" points={FILL_OUTLINE_POINTS} />
    </svg>
  );
}
