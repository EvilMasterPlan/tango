// In-memory tracking of per-word, per-skill practice history for the
// current session — no persistence, cleared on reload. Aggregated as each
// question is answered; meant to eventually weight word/variant selection
// toward the angles a user struggles with, instead of pure random sampling.
//
// Keyed by vocab entry id: id -> { id, skill: { [skillKey]: { correct, incorrect } } }
const practiceStats = new Map();

// Builds the skill key from a round's `hidden` property and `mode` — e.g.
// hidden: 'reading', mode: 'spelling' -> 'reading.spelling'. `hidden` is
// 'definition' internally, but reads as 'meaning' here to match how the
// question is actually framed to the user (guessing the meaning, not "the
// definition").
export function getSkillKey(hidden, mode) {
  const category = hidden === 'definition' ? 'meaning' : hidden;
  return `${category}.${mode}`;
}

// Every (hidden, mode) combination the quiz can generate a round under —
// word and meaning are always quizzed via multiple choice, reading can be
// choice, spelling, or typing. Mastery needs the full fixed set rather than
// just whichever keys happen to be present on a record, since an angle a
// word has never been practiced under should count as 0 correct, not be
// skipped entirely.
export const ALL_SKILL_KEYS = [
  getSkillKey('word', 'choice'),
  getSkillKey('reading', 'choice'),
  getSkillKey('reading', 'spelling'),
  getSkillKey('reading', 'typing'),
  getSkillKey('definition', 'choice'),
];

// Records one Check submission for a word under a given skill key.
export function recordPracticeAttempt(entryId, skillKey, isCorrect) {
  if (!practiceStats.has(entryId)) {
    practiceStats.set(entryId, { id: entryId, skill: {} });
  }
  const record = practiceStats.get(entryId);
  const skillCounts = record.skill[skillKey] || {};
  const countKey = isCorrect ? 'correct' : 'incorrect';
  skillCounts[countKey] = (skillCounts[countKey] || 0) + 1;
  record.skill[skillKey] = skillCounts;
}

// Looks up the practice record for a single word, if any.
export function getPracticeStats(entryId) {
  return practiceStats.get(entryId);
}

// All practice records gathered so far this session.
export function getAllPracticeStats() {
  return [...practiceStats.values()];
}

// A word's mastery level is the minimum correct-count across every possible
// skill angle, including angles never attempted (which count as 0) — e.g.
// answering reading.choice correctly 5 times doesn't help mastery at all
// until word.choice, reading.spelling, reading.typing, and meaning.choice
// have each also been gotten right at least that many times. So mastery
// only increases once every angle has been correctly answered one more time
// than the current level.
export function getMasteryLevel(entryId) {
  const record = practiceStats.get(entryId);
  return ALL_SKILL_KEYS.reduce((min, skillKey) => {
    const correct = record?.skill[skillKey]?.correct || 0;
    return Math.min(min, correct);
  }, Infinity);
}
