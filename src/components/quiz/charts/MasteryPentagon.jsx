import { RadarChart } from '@/components/quiz/charts/RadarChart';
import './MasteryPentagon.scss';

// Converts a word's mastery record into the per-axis correct counts
// RadarChart needs — one axis per skill key in `mastery`, the fixed set
// of quiz question angles a word can be practiced under (word/reading/
// spelling/typing/meaning), e.g. { 'word.choice': {correct, incorrect}, ...,
// iteration: 2, level: 2, iterationsForNextLevel: 5 }, in the order the API
// returns them (object key order is preserved for string keys). `iteration`,
// `level`, and `iterationsForNextLevel` are sibling summary fields alongside
// the per-skill entries, not axes themselves, so they're excluded from the
// chart axes; `iterationsForNextLevel` gets passed through to RadarChart
// as-is, alongside the current level's floor iteration (see
// `levelFloorIteration` below, derived from `level`/`iterationsForNextLevel`
// rather than the raw `iteration` bottleneck) — RadarChart scales both its
// iteration-progress rings and each axis's own point off of that floor (an
// axis further ahead of it sits further out).
// `level` (1-indexed — a fresh word starts at level 1) is also shown as its
// own label underneath.
//
// `currentSkillKey` (optional) is the axis for the question currently being
// asked — RadarChart previews what the shape would become if it's
// answered correctly, as long as that axis isn't already capped out at the
// outer edge.
//
// `initialMastery` (optional, same shape as `mastery`) is an earlier
// snapshot of the same word — when given, the chart shows that snapshot as
// a fixed baseline shape, plus a hatched "attempted" shape for how far each
// axis would reach if every attempt made since then (right or wrong) had
// been correct, with the real (correct-only) shape pulsing on top of it —
// showing both the progress made and the mistakes made getting there over
// the course of one quiz. `animationDelay` staggers that pulse relative to
// other pentagons animating at the same time.
//
// `justLeveledUp` (optional) is for the one review-phase edge case where
// `mastery` already reflects a level-up earned by the answer just graded —
// left alone, that renders next level's diagram, almost always still
// empty, right when the user expects to see the level they just filled.
// When true, the diagram (and label) shows the level just completed, full,
// instead — the correct counts already meet that level's threshold on
// every axis, or the level wouldn't have advanced at all, so the previous
// level's own floor/threshold recovers a genuinely full polygon rather
// than an approximation. Not meant for QuizSummary, which always shows the
// lesson's true final state.
const SUMMARY_KEYS = ['iteration', 'level', 'iterationsForNextLevel'];

// RadarChart scales every axis's position off of a floor iteration count —
// but that floor needs to stay fixed for the word's whole current level, not
// track `mastery.iteration` (the bottleneck skill's own correct count)
// directly. `iteration` only equals the level's floor right when the word
// enters the level; answering a lagging skill correctly raises the
// bottleneck (and so `iteration`) again before the level actually changes,
// which would otherwise yank the floor out from under every other axis and
// collapse them back toward center on the very submit that should grow the
// shape. The level's floor is derivable without duplicating masteryStore's
// threshold formula: `iterationsForNextLevel` is the iteration threshold for
// `level + 1`, and each level N always spans exactly N + 1 iterations, so
// subtracting `level + 1` recovers the threshold for the current level.
function levelFloorIteration({ level, iterationsForNextLevel }) {
  if (level == null || iterationsForNextLevel == null) return undefined;
  return iterationsForNextLevel - level - 1;
}

export function MasteryPentagon({ mastery = {}, currentSkillKey, initialMastery, animationDelay, justLeveledUp = false }) {
  const skillKeys = Object.keys(mastery).filter((key) => !SUMMARY_KEYS.includes(key));
  const correctCounts = skillKeys.map((skillKey) => mastery[skillKey].correct);
  const previewIndex = skillKeys.indexOf(currentSkillKey);

  // Swap in the just-completed level's own level/threshold in place of the
  // already-advanced ones on `mastery` — see `justLeveledUp` above. The
  // level's threshold is recoverable without a second lookup: it's exactly
  // the floor `levelFloorIteration` derives for the level `mastery` is
  // already sitting at (the iteration count that was just reached to enter
  // it).
  const displayMastery = justLeveledUp
    ? { ...mastery, level: (mastery.level ?? 1) - 1, iterationsForNextLevel: levelFloorIteration(mastery) }
    : mastery;

  const initialCorrectCounts = initialMastery
    ? skillKeys.map((skillKey) => initialMastery[skillKey]?.correct || 0)
    : null;

  // The correct-count-equivalent ceiling for each axis if every attempt
  // made since `initialMastery` (right or wrong) had landed correct —
  // final.correct plus this session's attempts, where this session's
  // attempts = (final.correct + final.incorrect) - (initial.correct +
  // initial.incorrect). Simplifies to final.correct + final.incorrect -
  // initial.incorrect. Always >= correctCounts, by exactly however many
  // wrong answers happened this session.
  const attemptedCounts = initialMastery
    ? skillKeys.map((skillKey) => {
        const final = mastery[skillKey];
        const initial = initialMastery[skillKey] || { correct: 0, incorrect: 0 };
        return final.correct + final.incorrect - initial.incorrect;
      })
    : null;

  return (
    <div className="mastery-pentagon">
      <RadarChart
        values={correctCounts}
        previewIndex={previewIndex === -1 ? null : previewIndex}
        iteration={levelFloorIteration(displayMastery)}
        iterationsForNextLevel={displayMastery.iterationsForNextLevel}
        fromValues={initialCorrectCounts}
        fromIteration={initialMastery && levelFloorIteration(initialMastery)}
        fromIterationsForNextLevel={initialMastery?.iterationsForNextLevel}
        attemptedValues={attemptedCounts}
        animationDelay={animationDelay}
      />
      <span className="mastery-pentagon__level">Level {displayMastery.level ?? 1}</span>
    </div>
  );
}
