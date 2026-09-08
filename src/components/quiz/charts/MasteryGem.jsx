import { GemChart } from '@/components/quiz/charts/GemChart';
import './MasteryGem.scss';

// Converts a word's mastery record into the per-axis correct counts
// GemChart needs — one axis per skill key in `mastery`, the fixed set
// of quiz question angles a word can be practiced under (word/reading/
// spelling/typing/meaning), e.g. { 'word.choice': {correct, incorrect}, ...,
// iteration: 2, level: 2, iterationsForNextLevel: 5 }, in the order the API
// returns them (object key order is preserved for string keys). `iteration`,
// `level`, and `iterationsForNextLevel` are sibling summary fields alongside
// the per-skill entries, not axes themselves, so they're excluded from the
// chart axes; `iterationsForNextLevel` gets passed through to GemChart
// as-is, alongside the current level's floor iteration (see
// `levelFloorIteration` below, derived from `level`/`iterationsForNextLevel`
// rather than the raw `iteration` bottleneck) — GemChart scales both its
// iteration-progress rings and each axis's own point off of that floor (an
// axis further ahead of it sits further out).
// `level` (1-indexed — a fresh word starts at level 1) is also shown as its
// own label underneath.
//
// `currentSkillKey` (optional) is the axis for the question currently being
// asked — GemChart previews what the shape would become if it's
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
//
// `flashCorrect` (optional) and `color` are passed straight through to
// GemChart — see its own doc comment for what each does.
const SUMMARY_KEYS = ['iteration', 'level', 'iterationsForNextLevel', 'wheelUnlockIteration'];

// word.wheel is the one axis excluded from the word's bottleneck/iteration
// calculation until it unlocks (see masteryStore.js's ALL_SKILL_KEYS) — so
// its own correct count restarts from 0 right as every other axis is
// already sitting at or past `wheelUnlockIteration`. `buildMastery` shifts
// word.wheel by that same constant when computing the word's overall
// `iteration`/`level`; `shiftedCorrect` below applies the identical shift
// here, so the chart agrees with what leveling already accounts for,
// rather than reading word.wheel as stuck behind even right after a
// correct answer. Only ever used for chart geometry — the raw `correct` on
// `mastery[WHEEL_SKILL_KEY]` itself stays untouched, since achievements and
// any other consumer counting actual attempts want the real number.
const WHEEL_SKILL_KEY = 'word.wheel';
function shiftedCorrect(skillEntry, skillKey, wheelUnlockIteration) {
  const correct = skillEntry?.correct || 0;
  return skillKey === WHEEL_SKILL_KEY ? correct + wheelUnlockIteration : correct;
}

// GemChart scales every axis's position off of a floor iteration count —
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

export function MasteryGem({
  mastery = {},
  currentSkillKey,
  initialMastery,
  animationDelay,
  justLeveledUp = false,
  flashCorrect = false,
  color,
}) {
  const skillKeys = Object.keys(mastery).filter((key) => !SUMMARY_KEYS.includes(key));
  // Present whenever WHEEL_SKILL_KEY is (see masteryStore.js's buildMastery)
  // — 0 otherwise, which makes shiftedCorrect's shift a no-op for a word
  // that hasn't unlocked word.wheel at all.
  const wheelUnlockIteration = mastery.wheelUnlockIteration ?? 0;
  const correctCounts = skillKeys.map((skillKey) => shiftedCorrect(mastery[skillKey], skillKey, wheelUnlockIteration));
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

  // A word can cross into word.wheel's unlock tier mid-lesson — `mastery`
  // (now) carries WHEEL_SKILL_KEY while `initialMastery` (the lesson's
  // starting snapshot) doesn't have it at all yet. shiftedCorrect treats
  // that missing entry as raw 0, so it comes out to exactly
  // `wheelUnlockIteration` — the fresh-unlock floor, which is genuinely
  // where that axis sat at the start of this lesson, not a phantom 0 that
  // would make the very unlock itself look like a full axis of progress.
  const initialCorrectCounts = initialMastery
    ? skillKeys.map((skillKey) => shiftedCorrect(initialMastery[skillKey], skillKey, wheelUnlockIteration))
    : null;

  // The correct-count-equivalent ceiling for each axis if every attempt
  // made since `initialMastery` (right or wrong) had landed correct —
  // final.correct plus this session's attempts, where this session's
  // attempts = (final.correct + final.incorrect) - (initial.correct +
  // initial.incorrect). Simplifies to final.correct + final.incorrect -
  // initial.incorrect. Always >= correctCounts, by exactly however many
  // wrong answers happened this session. word.wheel's raw correct/incorrect
  // aren't shifted (only its final `correct` reading is, elsewhere) — since
  // both terms of the subtraction are equally unshifted, the difference is
  // unaffected, so `wheelUnlockIteration` is added once at the end instead,
  // to land on the same shifted scale as correctCounts/initialCorrectCounts.
  const attemptedCounts = initialMastery
    ? skillKeys.map((skillKey) => {
        const final = mastery[skillKey];
        const initial = initialMastery[skillKey] || { correct: 0, incorrect: 0 };
        const raw = final.correct + final.incorrect - initial.incorrect;
        return skillKey === WHEEL_SKILL_KEY ? raw + wheelUnlockIteration : raw;
      })
    : null;

  return (
    <div className="mastery-gem">
      <GemChart
        values={correctCounts}
        previewIndex={previewIndex === -1 ? null : previewIndex}
        iteration={levelFloorIteration(displayMastery)}
        iterationsForNextLevel={displayMastery.iterationsForNextLevel}
        fromValues={initialCorrectCounts}
        fromIteration={initialMastery && levelFloorIteration(initialMastery)}
        fromIterationsForNextLevel={initialMastery?.iterationsForNextLevel}
        attemptedValues={attemptedCounts}
        animationDelay={animationDelay}
        flashCorrect={flashCorrect}
        color={color}
      />
      {/* The polygon itself renders the just-completed level's full shape
          (via `displayMastery`, above), but the label should already read
          the level that shape just earned — not the one being left behind. */}
      <span className="mastery-gem__level">Level {mastery.level ?? 1}</span>
    </div>
  );
}
