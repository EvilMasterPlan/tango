import { useId } from 'react';
import './RadarChart.scss';

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

// A small radar/spider chart: one axis per entry in `correctCounts`, each
// placed along the same floor-to-outer-edge scale as the iteration rings —
// at the floor if it's at the bottleneck iteration, further out the more
// it's ahead of the bottleneck, capped at the outer edge once it's already
// covered every iteration needed for the next level.
//
// `previewIndex` (optional) draws a second, diagonally-hatched radar
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
// instead of one, bottom to top: a static diagonally-hatched fill at
// `attemptedValues` (see below), a solid-white fill at the real shape that
// gently pulses opacity forever, and — on top of both, constant, never
// animated — a solid-white fill at that earlier shape. Correct counts
// never decrease, so that earlier shape is always <= both of the others on
// every axis; drawing it last as a fixed floor keeps "mastery already had
// before this quiz" reading as settled fact, while the hatch/pulse
// interplay above it stays legible as specifically the progress and
// mistakes made *during* this quiz — on any axis with a wrong answer along
// the way, the hatching stays visible past the pulsing shape's edge even
// at full opacity, since it reaches further out. `animationDelay` offsets
// when the pulse's cycle starts, so multiple charts animating together
// don't all flash in lockstep.
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
export function RadarChart({
  values: correctCounts,
  previewIndex = null,
  iteration,
  iterationsForNextLevel,
  fromValues = null,
  fromIteration,
  fromIterationsForNextLevel,
  attemptedValues = null,
  animationDelay = 0,
}) {
  const patternId = useId();
  const count = correctCounts.length;

  const scale = ringScale(iteration, iterationsForNextLevel);
  const ringRadii = iterationRingRadii(scale);
  const innerRingRadii = ringRadii.slice(0, -1);

  const floor = ringPoints(count, FLOOR_RADIUS);
  const outline = ringPoints(count, RADIUS);

  const finalRadii = fillRadii(correctCounts, iteration, scale);
  const finalFill = pointsAt(count, (index) => finalRadii[index]);

  const initialRadii = fromValues ? fillRadii(fromValues, fromIteration, ringScale(fromIteration, fromIterationsForNextLevel)) : null;
  const initialFill = initialRadii ? pointsAt(count, (index) => initialRadii[index]) : null;

  const attemptedRadii = fromValues ? fillRadii(attemptedValues || correctCounts, iteration, scale) : null;
  const attemptedFill = attemptedRadii ? pointsAt(count, (index) => attemptedRadii[index]) : null;

  const previewSteps = previewIndex != null ? axisSteps(correctCounts[previewIndex], iteration, scale) : null;
  const maxSteps = scale ? scale.stepsRemaining : 1;
  const showPreview = previewIndex != null && previewSteps < maxSteps;
  const preview = showPreview
    ? pointsAt(count, (index) =>
        index === previewIndex
          ? radiusForSteps(previewSteps + 1, scale)
          : radiusForSteps(axisSteps(correctCounts[index], iteration, scale), scale)
      )
    : null;
  const previewMarker = showPreview
    ? axisXY(axisAngle(previewIndex, count), radiusForSteps(previewSteps + 1, scale))
    : null;

  const needsHatchPattern = Boolean(preview) || Boolean(fromValues);

  return (
    <svg className="radar-chart" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {needsHatchPattern && (
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="2.2" height="2.2" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="2.2" className="radar-chart__hatch-line" />
          </pattern>
        </defs>
      )}
      <polygon className="radar-chart__floor" points={floor} />
      {innerRingRadii.map((radius) => (
        <polygon key={radius} className="radar-chart__iteration-ring" points={ringPoints(count, radius)} />
      ))}
      <polygon className="radar-chart__outline" points={outline} />
      {preview && <polygon className="radar-chart__preview" points={preview} fill={`url(#${patternId})`} />}
      {attemptedFill && <polygon className="radar-chart__preview" points={attemptedFill} fill={`url(#${patternId})`} />}
      <polygon
        className={fromValues ? 'radar-chart__final-pulse' : 'radar-chart__fill'}
        points={finalFill}
        style={fromValues ? { animationDelay: `${animationDelay}ms` } : undefined}
      />
      {/* Always the true minimum of every shape here (correct counts never
          decrease, so initial <= final <= attempted on every axis) — drawn
          last, constant, and never animated, so the "mastery already had
          before this quiz" region reads as settled fact, separate from the
          hatch/pulse interplay that's only meaningful for progress and
          mistakes made *during* this quiz. */}
      {initialFill && <polygon className="radar-chart__fill" points={initialFill} />}
      {previewMarker && <circle className="radar-chart__preview-marker" cx={previewMarker.x} cy={previewMarker.y} r="1.4" />}
    </svg>
  );
}
