import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { RadarChart } from '@/components/quiz/RadarChart';
import './Page.scss';

const GRID_COLUMNS = 6;
const GRID_ROWS = 2;
const AXIS_COUNT = 5;
// One section per "steps remaining until next level" value, so the grid
// shows a variety of ring counts — 3 steps means the floor plus 2 middle
// rings plus the brighter outer ring, 4 steps adds one more middle ring, etc.
const SECTION_STEPS = [2, 3, 4];
const ITERATION = 0;

function randomCorrectCounts(steps) {
  return Array.from({ length: AXIS_COUNT }, () => Math.floor(Math.random() * (steps + 1)));
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

function buildSection(steps) {
  const charts = Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (_, index) => {
    const correctCounts = randomCorrectCounts(steps);
    return { id: index, correctCounts, previewIndex: pickPreviewIndex(correctCounts, steps) };
  });
  return { steps, charts };
}

export function RadarDebugPage() {
  // Generated once per mount rather than per render, so the grids don't
  // reshuffle themselves on every unrelated re-render.
  const sections = useMemo(() => SECTION_STEPS.map(buildSection), []);

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Radar Debug</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="radar-debug">
        <div className="radar-debug__sections">
          {sections.map((section) => (
            <div className="radar-debug__section" key={section.steps}>
              <div className="radar-debug__grid">
                {section.charts.map((chart) => (
                  <RadarChart
                    key={chart.id}
                    values={chart.correctCounts}
                    previewIndex={chart.previewIndex}
                    iteration={ITERATION}
                    iterationsForNextLevel={section.steps}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
