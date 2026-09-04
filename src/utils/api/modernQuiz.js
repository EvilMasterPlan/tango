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
  // lessonType (optional) is forwarded as ?type= — see OvermindAPI's
  // modernQuiz/lessonPools.js LessonType for the valid values; the backend
  // defaults to NEW_WORDS for a missing/unrecognized one. choiceId (optional)
  // is forwarded as ?choice= — the TANGO_LessonChoices row this generation
  // was picked from, so the backend can record the selection against it.
  // { points } — Score summed across every completed lesson (see
  // OvermindAPI's tango/quiz.js getOverallStats).
  getOverallStats: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/overall-stats`));
  },
  generateLesson: async (lessonType, choiceId) => {
    const params = {};
    if (lessonType) params.type = lessonType;
    if (choiceId) params.choice = choiceId;
    const config = Object.keys(params).length > 0 ? { params } : {};
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/generate-lesson`), {}, config);
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
};
