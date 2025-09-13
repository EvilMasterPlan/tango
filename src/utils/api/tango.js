import { makePostRequest, makeGetRequest, getUrl } from './common';

const prefix = 'c5d81bb4-f511-484b-9ea1-a9b6ff936f21';

// /${TANGO_UUID}/vocab/practice/record

export const api = {
  getAllVocab: async () => {
    return makeGetRequest(getUrl(`${prefix}/vocab/all`));
  },
  getAllVocabPractice: async () => {
    return makeGetRequest(getUrl(`${prefix}/vocab/practice/all`));
  },
  postVocabPracticeRecord: async (vocabId, type, correct) => {
    return makePostRequest(getUrl(`${prefix}/vocab/practice/record`), {
      vocabId,
      type,
      correct,
    });
  },
}
