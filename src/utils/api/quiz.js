import { makePostRequest, getUrl } from './common';
import { TANGO_API_PREFIX } from './tango';

export const quizApi = {
  // { current, history } — current is the user's still-open lesson-choice
  // row (get-or-created: the same row keeps coming back until its lesson is
  // completed, so bailing out or reloading doesn't reshuffle), history is up
  // to the 2 prior (completed) rows before it.
  getNextLessons: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/next-lessons`));
  },
  // { points } — Score summed across every completed lesson.
  getOverallStats: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/overall-stats`));
  },
  // Records which tile the user picked on the home page against their
  // current lesson-choice row — the lesson-generation endpoint below reads
  // the same row back, so no lesson-selecting state needs to travel through
  // the URL.
  selectLessonChoice: async (choiceId, selectedType) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/quiz/select-lesson-choice`), { choiceId, selectedType });
  },
  // Resolves the lesson type from the user's current lesson-choice row —
  // defaults to NEW_WORDS if nothing's been selected (e.g. a direct /lesson
  // visit). Pass `lessonType` to instead start a "bonus" lesson of that
  // exact type (see Practice/Page.jsx) — the server skips reading/writing
  // the home page's lesson-choice row entirely in that case, so it doesn't
  // count as picking one of the day's suggested options, but the lesson
  // itself still gets scored/recorded normally. `lessonParams` (optional)
  // is extra data a seeded lesson type needs beyond the bare type string —
  // e.g. word_spotlight's { seedWordId } — meaningless without a
  // `lessonType` alongside it.
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
