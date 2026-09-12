import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GemChart } from '@/components/quiz/charts/GemChart';
import '@/pages/Marketing/Page.scss';

// Purely decorative — a tiled field of randomized mastery gems behind the
// content panel, same generative approach as Admin/RadarChartPreview's
// grid (random per-axis correct counts, occasional preview sliver), just
// fixed to 5 axes (the real always-on skill set every word starts with —
// see masteryStore.js's ALL_SKILL_KEYS) and cycling through every gem
// color instead of one plain axis-count/steps sweep, since this is meant
// to read as "a wall of real word gems" rather than a chart-geometry test.
const GEM_FIELD_COLUMNS = 8;
const GEM_FIELD_ROWS = 10;
const GEM_AXIS_COUNT = 5;
const GEM_COLORS = ['red', 'orange', 'yellow', 'green', 'blue'];
const GEM_STEP_OPTIONS = [2, 3, 4, 5];

function randomCorrectCounts(axisCount, steps) {
  return Array.from({ length: axisCount }, () => Math.floor(Math.random() * (steps + 1)));
}

// Same "pick one axis short of the outer edge" logic as RadarChartPreview's
// pickPreviewIndex — null (no preview sliver) if every axis already
// happens to be maxed out.
function pickPreviewIndex(correctCounts, steps) {
  const nonFullIndices = correctCounts.map((count, index) => (count < steps ? index : null)).filter((index) => index !== null);
  if (nonFullIndices.length === 0) return null;
  return nonFullIndices[Math.floor(Math.random() * nonFullIndices.length)];
}

function buildGemField() {
  return Array.from({ length: GEM_FIELD_COLUMNS * GEM_FIELD_ROWS }, (_, index) => {
    const steps = GEM_STEP_OPTIONS[Math.floor(Math.random() * GEM_STEP_OPTIONS.length)];
    const correctCounts = randomCorrectCounts(GEM_AXIS_COUNT, steps);
    return {
      id: index,
      steps,
      correctCounts,
      previewIndex: pickPreviewIndex(correctCounts, steps),
      color: GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)],
    };
  });
}

// aria-hidden — decoration only, nothing here is meaningful to a screen
// reader. Generated once per mount (useMemo) rather than per render, same
// reasoning as RadarChartPreview's own charts memo, so the field doesn't
// reshuffle itself on every unrelated re-render.
function MarketingGemField() {
  const gems = useMemo(buildGemField, []);

  return (
    <div className="marketing__gem-field" aria-hidden="true">
      {gems.map((gem) => (
        <GemChart
          key={gem.id}
          values={gem.correctCounts}
          previewIndex={gem.previewIndex}
          iteration={0}
          iterationsForNextLevel={gem.steps}
          color={gem.color}
        />
      ))}
    </div>
  );
}

export function MarketingPage() {
  return (
    <>
      <Helmet>
        <title>Tanuki Tango — Japanese Vocabulary Drills</title>
        <meta name="description" content="Master Japanese vocabulary through focused, spaced-repetition drilling." />
      </Helmet>

      <div className="marketing">
        <MarketingGemField />
        <div className="marketing__inner">
          <header className="marketing__header">
            <span className="marketing__wordmark">Tanuki Tango</span>
          </header>

          <main className="marketing__body">
            <h1 className="marketing__headline">An intensive Japanese vocabulary driller</h1>
            <p className="marketing__sub">
              Tanuki Tango keeps you on track with targeted vocabulary drilling from multiple angles, and lets you study as much as you want.
            </p>

            <ul className="marketing__features" aria-label="Key features">
              <li className="marketing__feature">Learn kanji by practicing whole words</li>
              <li className="marketing__feature">Drill words from different angles - kanji, reading, and meaning</li>
              <li className="marketing__feature">Short lessons you can complete in a few minutes</li>
            </ul>

            <Link to="/account/signup" className="btn btn-primary marketing__cta">
              Get started for free
            </Link>

            <p className="marketing__signin">
              Already have an account?{' '}
              <Link to="/account/login" className="marketing__signin-link">
                Sign in
              </Link>
            </p>
          </main>
        </div>
      </div>
    </>
  );
}
