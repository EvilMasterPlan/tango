import { makePostRequest, getUrl } from './common';
import { TANGO_API_PREFIX } from './tango';

export const quizApi = {
  // { current: { options }, history: [{ id, lessonType, perfect, score,
  // incorrectCount, completedAt, params }, ...] } — current's 3 options are
  // freshly derived on every call, not persisted (a reload re-rolls them);
  // history is the user's most recently completed lessons, most recent
  // first, read straight from actual lesson records rather than anything
  // resembling "the offer that led to it". `perfect` is true for a
  // zero-wrong-answer lesson; the rest ride along for the UI to use later.
  getNextLessons: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/next-lessons`));
  },
  // { points } — Score summed across every completed lesson.
  getOverallStats: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/overall-stats`));
  },
  // { days: [{ date: 'yyyy-MM-dd', count }, ...] } — one entry per day with
  // at least one completed lesson over the last ~year; days with zero are
  // omitted, not zero-filled (see Effort/Page.jsx, which fills the gaps for
  // the calendar). CompletedAt is stored in UTC, so grouping by calendar day
  // needs to know this browser's own UTC offset — otherwise a lesson
  // completed late in the local day (after UTC's midnight has already
  // rolled over) gets bucketed under tomorrow's date, a day Effort/Page.jsx
  // hasn't rendered yet, and today's count just stops moving.
  // getTimezoneOffset() is minutes to *add* to local time to reach UTC
  // (positive west of UTC) — exactly what the backend needs to shift a UTC
  // timestamp back to this browser's local calendar day.
  getEffort: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/effort`), {
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
  },
  // Generates a lesson of `lessonType` — every caller passes one explicitly
  // now (Home/Page.jsx picks one of getNextLessons' own recommended
  // options, Practice/Page.jsx sends an explicit/bonus type the same way),
  // falling back to NEW_WORDS server-side only for a direct /lesson visit
  // with nothing to pass. `lessonParams` (optional) is extra data a seeded
  // lesson type needs beyond the bare type string — e.g. word_spotlight's
  // { seedWordId } — meaningless without a `lessonType` alongside it.
  generateLesson: async (lessonType = null, lessonParams = null) => {
    const body = lessonType ? { lessonType, ...(lessonParams ? { lessonParams } : {}) } : {};
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/generate-lesson`), body);
  },
  recordPractice: async (entryId, skillKey, isCorrect) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/record-practice`), {
      entryId,
      skillKey,
      isCorrect,
    });
  },
  // answers: [{ entryId, isCorrect }, ...] for every question in the
  // lesson, in the order they were answered — the backend scores the
  // lesson from this and returns { totalScore, scoringBreakdown }.
  completeLesson: async (lessonId, answers) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/complete-lesson`), { lessonId, answers });
  },
  // { words: [{ entry, mastery }, ...], hasMore } — every word the user has
  // ever practiced, one page at a time, ordered by `sortBy` ('recency', the
  // default, 'challenge', or 'mastery') and `sortDirection` ('desc', the
  // default — most-recent/highest-score/highest-mastery first — or 'asc' to
  // reverse it). Same entry/mastery shape as generateLesson's rounds.
  // `jlptLevel` (optional, e.g. 'N5') restricts the page to words tagged
  // with that JLPT level.
  getWordProgress: async (offset, limit = 30, sortBy = 'recency', sortDirection = 'desc', jlptLevel = null) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/word-progress`), {
      offset,
      limit,
      sortBy,
      sortDirection,
      jlptLevel,
    });
  },
  // { channels: { [channel]: { current, tiers: [{ tier, name, description,
  // target, completed }] } } } — every tier of every achievement channel
  // (e.g. QUESTIONS_SUCCEEDED tiers 1/2/3), not just completed ones; fully
  // recomputed live on every call (nothing is persisted), so this is safe
  // to call fresh each page visit.
  getAchievements: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/achievements`));
  },
};
