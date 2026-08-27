import { makePostRequest, getUrl } from './common';
import { TANGO_API_PREFIX } from './tango';

export const modernQuizApi = {
  generateLesson: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/generate-lesson`));
  },
  recordPractice: async (entryId, skillKey, isCorrect) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/modern-quiz/record-practice`), {
      entryId,
      skillKey,
      isCorrect,
    });
  },
};
