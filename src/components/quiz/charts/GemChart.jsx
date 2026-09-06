import { useId, useMemo } from 'react';
import './GemChart.scss';

// DEPRECATION NOTE: This was an experiment on an alternate form of radar chart that looked like gem facets
// I may still yet come back to this, so let's not delete yet.

const SIZE = 40; // svg viewBox width/height — sized to leave room for the iteration rings between the floor and the outer edge
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 2; // small margin so the outer points aren't clipped
// Floor for an axis at the bottleneck iteration, as a fraction of RADIUS —
// collapsing every axis all the way to 0 means they'd all land on the exact
// same center point, so with every axis at the bottleneck the shape
// degenerates into a zero-area point and doesn't render at all. A small
// nonzero floor keeps every axis's point distinct, so the shape is always a
// real, visible polygon. It also doubles as the current level's floor
// radius for the iteration rings below.
const MIN_RADIUS_RATIO = 0.15;
const FLOOR_RADIUS = RADIUS * MIN_RADIUS_RATIO;

function axisAngle(index, total) {
  // Evenly spaced starting from the top and going clockwise.
  return (index / total) * 2 * Math.PI - Math.PI / 2;
}

function axisXY(angle, radius) {
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function axisPoint(angle, radius) {
  const { x, y } = axisXY(angle, radius);
  return `${x},${y}`;
}

// Same radius on every axis — used for the floor/ring/outline guides.
function ringPoints(count, radius) {
  return Array.from({ length: count }, (_, index) => axisPoint(axisAngle(index, count), radius)).join(' ');
}

// A different radius per axis, from `radiusAt(index)` — used for the fill
// and preview shapes, where each axis sits at its own distance out.
function pointsAt(count, radiusAt) {
  return Array.from({ length: count }, (_, index) => axisPoint(axisAngle(index, count), radiusAt(index))).join(' ');
}

// Splits a shape into `2 * count` triangular facets — each axis-to-axis
// wedge (center, axis i, axis i+1) cut again down its middle — so the
// current-mastery fill reads as a cut gem's individual faces instead of one
// flat polygon. The cut lands exactly on the wedge's outer edge (the
// midpoint of the straight line between the two axis points, not an
// independently-placed point), so the two halves retile that edge exactly
// and the overall silhouette is unchanged from a single `count`-facet cut.
// Each facet also carries its own angular midpoint, used below to shade it
// as if lit from one direction.
function facetSlices(count, radiusAt) {
  const slices = [];
  for (let index = 0; index < count; index++) {
    const angleA = axisAngle(index, count);
    const angleB = axisAngle(index + 1, count);
    const pointA = axisXY(angleA, radiusAt(index));
    const pointB = axisXY(angleB, radiusAt((index + 1) % count));
    const seamPoint = { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 };
    const seamAngle = Math.atan2(seamPoint.y - CENTER, seamPoint.x - CENTER);
    const pointStr = ({ x, y }) => `${x},${y}`;
    slices.push({
      points: `${CENTER},${CENTER} ${pointStr(pointA)} ${pointStr(seamPoint)}`,
      midAngle: (angleA + seamAngle) / 2,
    });
    slices.push({
      points: `${CENTER},${CENTER} ${pointStr(seamPoint)} ${pointStr(pointB)}`,
      midAngle: (seamAngle + angleB) / 2,
    });
  }
  return slices;
}

// A simulated light source so facet shades vary smoothly around the shape —
// brighter where a facet faces the light, dimmer where it faces away — plus
// a per-facet random jitter on top, so neighboring facets don't form an
// perfectly smooth gradient but instead swing between noticeably dark and
// light shades, like the uneven glint of a real cut gem's many faces.
const FACET_LIGHT_ANGLE = -Math.PI * 0.75;
const FACET_HUES = { red: 0, orange: 30, yellow: 50, green: 140, blue: 210 };
const DEFAULT_GEM_COLOR = 'blue';
const FACET_SATURATION = 75;
const FACET_MIN_LIGHTNESS = 35;
const FACET_MAX_LIGHTNESS = 90;
const FACET_JITTER = 12;
function facetFill(midAngle, jitter = 0, hue = FACET_HUES[DEFAULT_GEM_COLOR]) {
  const t = (Math.cos(midAngle - FACET_LIGHT_ANGLE) + 1) / 2;
  const lightness = FACET_MIN_LIGHTNESS + t * (FACET_MAX_LIGHTNESS - FACET_MIN_LIGHTNESS);
  const clamped = Math.min(95, Math.max(10, lightness + jitter));
  return `hsl(${hue}, ${FACET_SATURATION}%, ${clamped}%)`;
}

// The step scale shared by the iteration rings and the per-axis fill: the
// distance from the floor to the outer edge, divided into one step per
// iteration still needed before the next level. Returns null when there's
// no iteration data to scale against (caller falls back to a plain
// floor/outer-edge scale in that case).
function ringScale(iteration, iterationsForNextLevel) {
  if (iteration == null || iterationsForNextLevel == null) return null;
  const stepsRemaining = iterationsForNextLevel - iteration;
  if (stepsRemaining <= 0) return null;
  return { stepsRemaining, step: (RADIUS - FLOOR_RADIUS) / stepsRemaining };
}

// Evenly spaced radii between the current level's floor and the outer edge,
// one per iteration remaining until the next level — e.g. iteration 2 of 5
// needed produces radii for iterations 3, 4, and 5. The last radius always
// equals RADIUS exactly (that's the actual level-up threshold, drawn
// brighter than the others).
function iterationRingRadii(scale) {
  if (!scale) return [];
  return Array.from({ length: scale.stepsRemaining }, (_, index) => FLOOR_RADIUS + (index + 1) * scale.step);
}

// How many ring-steps ahead of the bottleneck a single axis's own correct
// count is, capped at the number of steps left until the next level — an
// axis already answered correctly more times than the bottleneck axis sits
// further out, up to the outer edge.
function axisSteps(correctCount, iteration, scale) {
  if (!scale) return correctCount > 0 ? 1 : 0;
  return Math.min(Math.max(correctCount - iteration, 0), scale.stepsRemaining);
}

function radiusForSteps(steps, scale) {
  const step = scale ? scale.step : RADIUS - FLOOR_RADIUS;
  return FLOOR_RADIUS + steps * step;
}

// The fill's per-axis radii for one mastery snapshot — shared by the real
// (`values`/`iteration`/...) and initial (`fromValues`/...) props below,
// since both need the exact same counts-to-geometry conversion.
function fillRadii(correctCounts, iteration, scale) {
  return correctCounts.map((correctCount) => radiusForSteps(axisSteps(correctCount, iteration, scale), scale));
}

// A small gem chart: one axis per entry in `correctCounts`, each
// placed along the same floor-to-outer-edge scale as the iteration rings —
// at the floor if it's at the bottleneck iteration, further out the more
// it's ahead of the bottleneck, capped at the outer edge once it's already
// covered every iteration needed for the next level.
//
// `previewIndex` (optional) draws a second, diagonally-hatched gem
// behind the real one with that one axis given one more correct answer — a
// preview of what the shape would become, plus a small bright marker right
// at that axis's new vertex so the change reads even when the hatched area
// itself is too small or too faint to notice. Pass null (or the index of an
// axis already capped at the outer edge) to skip the preview.
//
// `iteration`/`iterationsForNextLevel` (optional) scale both the fill above
// and a stack of guide rings drawn behind everything: an inner pentagon at
// the floor radius (the word's current level), a soft grey ring per
// iteration still needed, and a brighter outer ring at the actual level-up
// threshold. Omit either to fall back to a plain extended/not-extended
// scale with a single plain outer edge.
//
// `fromValues`/`fromIteration`/`fromIterationsForNextLevel` (optional) are
// a second, earlier mastery snapshot — when given, three layers are drawn
// instead of one, bottom to top: a solid-white fill at the real (current)
// shape that gently pulses opacity forever, alternating between transparent
// and solid white; a static diagonally-hatched fill at `attemptedValues`
// (see below), showing the sliver of growth beyond the previous shape,
// visible through the pulse layer during its transparent phase; and, on
// top of both, the previous shape itself, still properly faceted (not
// flattened to plain white, so it keeps reading as a gem rather than a flat
// backdrop) — this is what stays solidly visible throughout, with the
// growth since then peeking out around its edges instead of covering it.
// Pulsing a flat overlay like this, rather than animating the facet
// geometry itself, keeps the reveal legible — animating the facets' own
// colors read as flickering rather than a clean before/after comparison.
// `animationDelay` offsets when the pulse's cycle starts, so multiple
// charts animating together don't all flash in lockstep.
//
// `attemptedValues` (optional, same shape as `values`) is what the hatch
// layer above is drawn from — a per-axis ceiling of what `values` would be
// if every attempt counted toward it, right or wrong, rather than only the
// correct ones. Falls back to `values` itself (i.e. no visible gap) if
// omitted while `fromValues` is given.
//
// Guide rings/floor/outline are always drawn at the real, current values
// regardless. Meant for a "before vs. after" reveal, not the live quiz, so
// omitting these props (as every other caller does) renders just one
// static fill at the real shape, with no hatching or pulse.
//
// `color` (optional, 'red' | 'orange' | 'yellow' | 'green' | 'blue', default
// 'blue') picks the facet/core/outer-edge hue from FACET_HUES above —
// everything else (inner guide rings, hatching, the reveal pulse, the
// current-mastery border) stays neutral white/grey regardless of which one
// is chosen.
export function GemChart({
  values: correctCounts,
  previewIndex = null,
  iteration,
  iterationsForNextLevel,
  fromValues = null,
  fromIteration,
  fromIterationsForNextLevel,
  attemptedValues = null,
  animationDelay = 0,
  color = DEFAULT_GEM_COLOR,
}) {
  const patternId = useId();
  const count = correctCounts.length;
  const hue = FACET_HUES[color];

  const scale = ringScale(iteration, iterationsForNextLevel);
  const ringRadii = iterationRingRadii(scale);
  const innerRingRadii = ringRadii.slice(0, -1);

  const floor = ringPoints(count, FLOOR_RADIUS);
  const outline = ringPoints(count, RADIUS);

  const finalRadii = fillRadii(correctCounts, iteration, scale);
  const finalFacets = facetSlices(count, (index) => finalRadii[index]);
  // The overall mastery-shape silhouette — same outline the facets retile —
  // traced as a border around just the current state, not the preview or
  // attempted/hatched shapes.
  const finalOutline = pointsAt(count, (index) => finalRadii[index]);
  // Per-facet random lightness offset (see FACET_JITTER above). Chosen once
  // per chart instance rather than per render, so shades don't shuffle on
  // every unrelated re-render.
  const facetJitters = useMemo(
    () => finalFacets.map(() => (Math.random() * 2 - 1) * FACET_JITTER),
    [finalFacets.length]
  );
  // The core's own shade — a random shade in the same lit-angle range the
  // facets use, so it reads as another (fixed-position) facet rather than a
  // color plucked from outside that family.
  const coreFill = useMemo(() => facetFill(Math.random() * 2 * Math.PI, 0, hue), [hue]);

  const initialRadii = fromValues ? fillRadii(fromValues, fromIteration, ringScale(fromIteration, fromIterationsForNextLevel)) : null;
  // The "previous" state, faceted just like the current one, rather than a
  // flat fill — this is what stays visible and readable underneath the
  // hatch/pulse reveal below (see the comment on the `fromValues` prop).
  const previousFacets = initialRadii ? facetSlices(count, (index) => initialRadii[index]) : null;

  const attemptedRadii = fromValues ? fillRadii(attemptedValues || correctCounts, iteration, scale) : null;
  const attemptedFill = attemptedRadii ? pointsAt(count, (index) => attemptedRadii[index]) : null;

  const previewSteps = previewIndex != null ? axisSteps(correctCounts[previewIndex], iteration, scale) : null;
  const maxSteps = scale ? scale.stepsRemaining : 1;
  const showPreview = previewIndex != null && previewSteps < maxSteps;
  // Just the sliver of area the previewed axis's extra step would add beyond
  // the current shape — not the entire hypothetical future shape, since the
  // other axes don't change and are already covered by the real fill. It's
  // the quadrilateral between the two neighboring axes' (unchanged) current
  // points and the previewed axis's current vs. extended points.
  const previewDelta = showPreview
    ? (() => {
        const previousIndex = (previewIndex - 1 + count) % count;
        const nextIndex = (previewIndex + 1) % count;
        const leftPoint = axisPoint(axisAngle(previousIndex, count), finalRadii[previousIndex]);
        const rightPoint = axisPoint(axisAngle(nextIndex, count), finalRadii[nextIndex]);
        const currentTip = axisPoint(axisAngle(previewIndex, count), finalRadii[previewIndex]);
        const extendedTip = axisPoint(axisAngle(previewIndex, count), radiusForSteps(previewSteps + 1, scale));
        return `${leftPoint} ${extendedTip} ${rightPoint} ${currentTip}`;
      })()
    : null;
  const previewMarker = showPreview
    ? axisXY(axisAngle(previewIndex, count), radiusForSteps(previewSteps + 1, scale))
    : null;

  const needsHatchPattern = Boolean(previewDelta) || Boolean(fromValues);

  return (
    <svg className="gem-chart" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {needsHatchPattern && (
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="2.2" height="2.2" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="2.2" className="gem-chart__hatch-line" />
          </pattern>
        </defs>
      )}
      <polygon className="gem-chart__floor" points={floor} />
      {innerRingRadii.map((radius) => (
        <polygon key={radius} className="gem-chart__iteration-ring" points={ringPoints(count, radius)} />
      ))}
      <polygon className="gem-chart__outline" points={outline} style={{ stroke: `hsl(${hue}, ${FACET_SATURATION}%, 60%)` }} />
      {previewDelta && <polygon className="gem-chart__preview" points={previewDelta} fill={`url(#${patternId})`} />}
      {previousFacets ? (
        <>
          {/* Pulses between transparent and solid white, rather than
              animating the facet geometry itself, which read as flickering
              rather than a clean before/after reveal. Sits underneath the
              previous shape below, so it only reads in the ring of growth
              beyond it. */}
          <polygon
            className="gem-chart__reveal-pulse"
            points={finalOutline}
            style={{ animationDelay: `${animationDelay}ms` }}
          />
          {/* The hatch shows the sliver of growth beyond the previous
              faceted shape, up to the attempted ceiling — visible through
              the pulse layer above during its transparent phase. */}
          {attemptedFill && <polygon className="gem-chart__preview" points={attemptedFill} fill={`url(#${patternId})`} />}
          {/* The previous state stays properly faceted (not flattened to
              plain white) and drawn on top, so it stays solidly visible
              throughout while the reveal plays out around its edges. */}
          {previousFacets.map(({ points, midAngle }, index) => (
            <polygon
              key={index}
              className="gem-chart__facet"
              points={points}
              style={{ fill: facetFill(midAngle, facetJitters[index], hue) }}
            />
          ))}
        </>
      ) : (
        finalFacets.map(({ points, midAngle }, index) => (
          <polygon
            key={index}
            className="gem-chart__facet"
            points={points}
            style={{ fill: facetFill(midAngle, facetJitters[index], hue) }}
          />
        ))
      )}
      {/* The gem's core — always a solid pentagon at the floor radius, on
          top of the facets/pulse/minimum-shape fill regardless of which
          props are passed, so the chart always reads as a gem with a
          distinct center rather than a flat faceted disc. Its shade is
          randomized once per instance like the facets' shine. */}
      <polygon className="gem-chart__core" points={floor} style={{ fill: coreFill, stroke: coreFill }} />
      {/* Drawn above even the core, so the current-mastery outline stays
          crisp no matter what it coincides with underneath. */}
      <polygon className="gem-chart__border" points={finalOutline} />
      {previewMarker && <circle className="gem-chart__preview-marker" cx={previewMarker.x} cy={previewMarker.y} r="1.4" />}
    </svg>
  );
}
