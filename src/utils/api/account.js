import { makePostRequest, getUrl } from '@/utils/api/common';
import { TANGO_API_PREFIX } from '@/utils/api/tango';

export const accountApi = {
  loadProfile: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/profile`), {});
  },

  getVerification: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/verification/load`));
  },

  sendVerificationCode: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/verification/send`));
  },

  verifyCode: async (code) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/verification/check`), { code });
  },
};
