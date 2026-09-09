import './MasteryGemIcon.scss';

// A static, hardcoded version of GemChart/MasteryGem's pentagon gem, reworked
// as a 6-axis hex and filled halfway to its outer edge (to the first guide
// ring) rather than all the way — no per-word data, no animation, no
// hatching/preview layer. Used anywhere the mastery gem's shape is wanted
// purely as an icon (e.g. empty states, marketing bits) rather than as a
// live mastery visualization.
//
// The geometry below is GemChart's own facet/lighting math, evaluated by
// hand for 6 evenly-spaced axes with every axis sitting at the midpoint
// between the floor and outer radius, so it can be dropped in as plain SVG
// markup with no computation at render time. See GemChart.jsx for how the
// real chart derives these same points/facets dynamically, and for what the
// floor/guide-ring/outline layers represent.

// Same hue values as GemChart.jsx's own (unexported) FACET_HUES — kept in
// sync by hand since this icon renders its facets as plain markup rather
// than sharing GemChart's color logic. Exported so other UI wanting the
// same color-per-`jlptGemColor` scheme (e.g. StatsDialog's progress bars)
// doesn't need its own copy.
export const GEM_HUES = { red: 0, orange: 30, yellow: 50, green: 140, blue: 210 };

// One lightness per facet, in the same draw order as the polygons below —
// carried over from GemChart's own light-angle shading formula, evaluated
// by hand for this icon's fixed geometry (6 axes, filled halfway out).
const FACET_LIGHTNESSES = [76, 63, 49, 39, 35, 39, 49, 63, 76, 86, 90, 86];
const FACET_POINTS = [
  '20,20 20,9.65 24.482,12.2375',
  '20,20 24.482,12.2375 28.964,14.825',
  '20,20 28.964,14.825 28.964,20.0',
  '20,20 28.964,20.0 28.964,25.175',
  '20,20 28.964,25.175 24.482,27.7625',
  '20,20 24.482,27.7625 20,30.35',
  '20,20 20,30.35 15.518,27.7625',
  '20,20 15.518,27.7625 11.036,25.175',
  '20,20 11.036,25.175 11.036,20.0',
  '20,20 11.036,20.0 11.036,14.825',
  '20,20 11.036,14.825 15.518,12.2375',
  '20,20 15.518,12.2375 20,9.65',
];

const FLOOR_POINTS = '20,17.3 22.338,18.65 22.338,21.35 20,22.7 17.662,21.35 17.662,18.65';
const RING_POINTS = '20,9.65 28.964,14.825 28.964,25.175 20,30.35 11.036,25.175 11.036,14.825';
const OUTLINE_POINTS = '20,2 35.588,11 35.588,29 20,38 4.412,29 4.412,11';

export function MasteryGemIcon({ className, color = 'blue' }) {
  const hue = GEM_HUES[color] ?? GEM_HUES.blue;

  return (
    <svg
      className={['mastery-gem-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      {/* Guide layers, always drawn at their fixed radii regardless of how
          far the fill reaches — same floor/iteration-ring/outline stack
          GemChart draws behind its fill. */}
      <polygon className="mastery-gem-icon__floor" points={FLOOR_POINTS} />
      <polygon className="mastery-gem-icon__ring" points={RING_POINTS} />
      <polygon className="mastery-gem-icon__outline" points={OUTLINE_POINTS} style={{ stroke: `hsl(${hue}, 75%, 60%)` }} />
      {/* Twelve triangular facets, center-to-two-adjacent-axis-points each
          cut down its middle — same faceting GemChart applies to the
          current-mastery fill, with lightness values carried over from its
          light-angle shading formula for a shape filled halfway out. */}
      {FACET_POINTS.map((points, index) => (
        <polygon
          key={points}
          className="mastery-gem-icon__facet"
          style={{ fill: `hsl(${hue}, 75%, ${FACET_LIGHTNESSES[index]}%)` }}
          points={points}
        />
      ))}
      {/* The gem's core — a solid hexagon at the floor radius, on top of the
          facets, same as GemChart's always-on center. */}
      <polygon className="mastery-gem-icon__core" points={FLOOR_POINTS} style={{ fill: `hsl(${hue}, 75%, 60%)`, stroke: `hsl(${hue}, 75%, 60%)` }} />
      {/* A border around just the (half-full) fill shape, drawn on top of
          everything so it reads as a crisp edge. */}
      <polygon className="mastery-gem-icon__border" points={RING_POINTS} />
    </svg>
  );
}
