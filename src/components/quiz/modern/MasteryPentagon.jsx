import { PolygonChart } from '@/components/quiz/modern/PolygonChart';
import './MasteryPentagon.scss';

// Converts a word's mastery record into the per-axis correct counts
// PolygonChart needs — one axis per skill key in `mastery`, the fixed set
// of quiz question angles a word can be practiced under (word/reading/
// spelling/typing/meaning), e.g. { 'word.choice': {correct, incorrect}, ...,
// iteration: 2, level: 2, iterationsForNextLevel: 5 }, in the order the API
// returns them (object key order is preserved for string keys). `iteration`,
// `level`, and `iterationsForNextLevel` are sibling summary fields alongside
// the per-skill entries, not axes themselves, so they're excluded from the
// chart axes; `iteration`/`iterationsForNextLevel` still get passed through
// to PolygonChart, which scales both its iteration-progress rings and each
// axis's own point off of them (an axis further ahead of the bottleneck
// iteration sits further out, not just "extended" vs "not"). `level` (1-
// indexed — a fresh word starts at level 1) is shown as its own label
// underneath instead.
//
// `currentSkillKey` (optional) is the axis for the question currently being
// asked — PolygonChart previews what the shape would become if it's
// answered correctly, as long as that axis isn't already capped out at the
// outer edge.
const SUMMARY_KEYS = ['iteration', 'level', 'iterationsForNextLevel'];

export function MasteryPentagon({ mastery = {}, currentSkillKey }) {
  const skillKeys = Object.keys(mastery).filter((key) => !SUMMARY_KEYS.includes(key));
  const correctCounts = skillKeys.map((skillKey) => mastery[skillKey].correct);
  const previewIndex = skillKeys.indexOf(currentSkillKey);

  return (
    <div className="mastery-pentagon">
      <PolygonChart
        values={correctCounts}
        previewIndex={previewIndex === -1 ? null : previewIndex}
        iteration={mastery.iteration}
        iterationsForNextLevel={mastery.iterationsForNextLevel}
      />
      <span className="mastery-pentagon__level">Level {mastery.level ?? 1}</span>
    </div>
  );
}
