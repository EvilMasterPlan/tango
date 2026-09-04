import { makePostRequest, getUrl } from './common';
import { TANGO_API_PREFIX } from './tango';

export const modernQuizApi = {
  // { current, history } — current is the user's still-open TANGO_LessonChoices
  // row (get-or-created: the same row keeps coming back until its lesson is
  // completed, so bailing out or reloading doesn't reshuffle), history is up
  // to the 2 prior (completed) rows before it — see OvermindAPI's
  // tango/quiz.js getNextLessons.
  getNextLessons: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/next-lessons`));
  },
  // { points } — Score summed across every completed lesson (see
  // OvermindAPI's tango/quiz.js getOverallStats).
  getOverallStats: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/overall-stats`));
  },
  // Records which tile the user picked on the home page against their
  // current TANGO_LessonChoices row (see Home Page.jsx's startSelectedLesson,
  // which awaits this before navigating to /lesson) — generateLesson below
  // reads the same row back, so no lesson-selecting state needs to travel
  // through the URL.
  selectLessonChoice: async (choiceId, selectedType) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/select-lesson-choice`), { choiceId, selectedType });
  },
  // Resolves the lesson type from the user's current TANGO_LessonChoices row
  // (see OvermindAPI's tango/quiz.js generateLesson) — defaults to NEW_WORDS
  // if nothing's been selected (e.g. a direct /lesson visit).
  generateLesson: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/generate-lesson`), {});
  },
  recordPractice: async (entryId, skillKey, isCorrect) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/record-practice`), {
      entryId,
      skillKey,
      isCorrect,
    });
  },
  // answers: [{ entryId, isCorrect }, ...] for every question in the
  // lesson, in the order they were answered — the backend scores the
  // lesson from this and returns { totalScore, scoringBreakdown } (see
  // OvermindAPI's modernQuiz/scoring.js) instead of the client computing
  // rewards itself.
  completeLesson: async (lessonId, answers) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/complete-lesson`), { lessonId, answers });
  },
  // { words: [{ entry, mastery }, ...], hasMore } — every word the user has
  // ever practiced, one page at a time, ordered by most recent attempt
  // (`sortOrder` 'newest', the default, or 'oldest' to reverse it — see
  // OvermindAPI's tango/quiz.js getWordProgress). Same entry/mastery shape
  // as generateLesson's rounds.
  getWordProgress: async (offset, limit = 30, sortOrder = 'newest') => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/word-progress`), { offset, limit, sortOrder });
  },
};
