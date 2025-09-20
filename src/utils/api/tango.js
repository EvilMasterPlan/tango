import { makePostRequest, makeGetRequest, getUrl } from './common';

const prefix = 'c5d81bb4-f511-484b-9ea1-a9b6ff936f21';

// /${TANGO_UUID}/tags/all

export const api = {
  getAllTags: async () => {
    return makeGetRequest(getUrl(`${prefix}/tags/all`));
  },
  getOverallProgress: async () => {
    return makeGetRequest(getUrl(`${prefix}/progress/get-progress-overview`));
  },
  getAllVocab: async () => {
    return makeGetRequest(getUrl(`${prefix}/vocab/all`));
  },
  getAllVocabPractice: async () => {
    return makeGetRequest(getUrl(`${prefix}/vocab/practice/all`));
  },
  postVocabPracticeRecord: async (practiceRecords) => {
    return makePostRequest(getUrl(`${prefix}/vocab/practice/record`), {answers: practiceRecords});
  },
  postVocabLessonGenerate: async (tagIDs) => {
    return makePostRequest(getUrl(`${prefix}/vocab/lesson/generate`), {
      tagIDs,
    });
  },
}
