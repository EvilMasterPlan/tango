import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { RadarChart } from '@/components/quiz/RadarChart';
import './Page.scss';

// One value per column-pair / row-pair — see buildGrid below. The real app
// (MasteryPentagon) always uses exactly 5 fixed skill keys; the extra axis
// counts here are purely to eyeball RadarChart with non-pentagon input.
const AXIS_COUNTS = [5, 6, 7];
const SECTION_STEPS = [2, 3, 4];
const ITERATION = 0;
const GRID_COLUMNS = AXIS_COUNTS.length * 2;
const GRID_ROWS = SECTION_STEPS.length * 2;

function randomCorrectCounts(axisCount, steps) {
  return Array.from({ length: axisCount }, () => Math.floor(Math.random() * (steps + 1)));
}

// Picks one axis short of the outer edge to preview a +1 correct answer on,
// or null if every axis already happens to be maxed out.
function pickPreviewIndex(correctCounts, steps) {
  const nonFullIndices = correctCounts
    .map((count, index) => (count - ITERATION < steps ? index : null))
    .filter((index) => index !== null);
  if (nonFullIndices.length === 0) return null;
  return nonFullIndices[Math.floor(Math.random() * nonFullIndices.length)];
}

// Each column pair is one axis count, each row pair is one steps value —
// e.g. the top-left 2x2 block is 5 axes at 2 steps, the block to its right
// is 6 axes at 2 steps, and so on, giving every (axis count, steps)
// combination its own small cluster of randomized charts to compare at once.
function buildGrid() {
  return Array.from({ length: GRID_ROWS * GRID_COLUMNS }, (_, index) => {
    const row = Math.floor(index / GRID_COLUMNS);
    const column = index % GRID_COLUMNS;
    const axisCount = AXIS_COUNTS[Math.floor(column / 2)];
    const steps = SECTION_STEPS[Math.floor(row / 2)];
    const correctCounts = randomCorrectCounts(axisCount, steps);
    return { id: index, steps, correctCounts, previewIndex: pickPreviewIndex(correctCounts, steps) };
  });
}

export function RadarDebugPage() {
  // Generated once per mount rather than per render, so the grid doesn't
  // reshuffle itself on every unrelated re-render.
  const charts = useMemo(buildGrid, []);

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Radar Debug</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="radar-debug">
        <div className="radar-debug__grid">
          {charts.map((chart) => (
            <RadarChart
              key={chart.id}
              values={chart.correctCounts}
              previewIndex={chart.previewIndex}
              iteration={ITERATION}
              iterationsForNextLevel={chart.steps}
            />
          ))}
        </div>
      </div>
    </>
  );
}
