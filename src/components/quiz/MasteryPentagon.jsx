import { RadarChart } from '@/components/quiz/RadarChart';
import './MasteryPentagon.scss';

// Converts a word's mastery record into the per-axis correct counts
// RadarChart needs — one axis per skill key in `mastery`, the fixed set
// of quiz question angles a word can be practiced under (word/reading/
// spelling/typing/meaning), e.g. { 'word.choice': {correct, incorrect}, ...,
// iteration: 2, level: 2, iterationsForNextLevel: 5 }, in the order the API
// returns them (object key order is preserved for string keys). `iteration`,
// `level`, and `iterationsForNextLevel` are sibling summary fields alongside
// the per-skill entries, not axes themselves, so they're excluded from the
// chart axes; `iteration`/`iterationsForNextLevel` still get passed through
// to RadarChart, which scales both its iteration-progress rings and each
// axis's own point off of them (an axis further ahead of the bottleneck
// iteration sits further out, not just "extended" vs "not"). `level` (1-
// indexed — a fresh word starts at level 1) is shown as its own label
// underneath instead.
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
// see QuizSummary, showing both the progress made and the mistakes made
// getting there over the course of one quiz. `animationDelay` staggers
// that pulse relative to other pentagons animating at the same time.
const SUMMARY_KEYS = ['iteration', 'level', 'iterationsForNextLevel'];

export function MasteryPentagon({ mastery = {}, currentSkillKey, initialMastery, animationDelay }) {
  const skillKeys = Object.keys(mastery).filter((key) => !SUMMARY_KEYS.includes(key));
  const correctCounts = skillKeys.map((skillKey) => mastery[skillKey].correct);
  const previewIndex = skillKeys.indexOf(currentSkillKey);

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
        iteration={mastery.iteration}
        iterationsForNextLevel={mastery.iterationsForNextLevel}
        fromValues={initialCorrectCounts}
        fromIteration={initialMastery?.iteration}
        fromIterationsForNextLevel={initialMastery?.iterationsForNextLevel}
        attemptedValues={attemptedCounts}
        animationDelay={animationDelay}
      />
      <span className="mastery-pentagon__level">Level {mastery.level ?? 1}</span>
    </div>
  );
}
