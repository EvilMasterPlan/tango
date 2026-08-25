import { makePostRequest, makeGetRequest, getUrl } from './common';

export const TANGO_API_PREFIX = 'c5d81bb4-f511-484b-9ea1-a9b6ff936f21';

// /${TANGO_UUID}/tags/all

export const api = {
  getAllTags: async () => {
    return makeGetRequest(getUrl(`${TANGO_API_PREFIX}/tags/all`));
  },
  getAllVocab: async () => {
    return makeGetRequest(getUrl(`${TANGO_API_PREFIX}/vocab/all`));
  },
  getAllVocabPractice: async () => {
    return makeGetRequest(getUrl(`${TANGO_API_PREFIX}/vocab/practice/all`));
  },
  postVocabPracticeRecord: async (practiceRecords) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/vocab/practice/record`), {answers: practiceRecords});
  },
  postVocabLessonGenerate: async (tagIDs) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/vocab/lesson/generate`), {
      tagIDs,
    });
  },
  postVocabMark: async (vocabID, marker) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/vocab/mark`), {
      vocabID,
      marker,
    });
  },
}
