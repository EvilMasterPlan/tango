import { makePostRequest, getUrl } from './common';
import { TANGO_API_PREFIX } from './tango';

export const modernQuizApi = {
  // Which lesson types are unlocked for the current user (always at least
  // new_words), in a random order re-shuffled by the backend on every call
  // — see OvermindAPI's tango/quiz.js getNextLessons.
  getNextLessons: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/next-lessons`));
  },
  // lessonType (optional) is forwarded as ?type= — see OvermindAPI's
  // modernQuiz/lessonPools.js LessonType for the valid values; the backend
  // defaults to NEW_WORDS for a missing/unrecognized one.
  generateLesson: async (lessonType) => {
    const config = lessonType ? { params: { type: lessonType } } : {};
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
