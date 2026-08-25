import { makePostRequest, getUrl } from '@/utils/api/common';
import { TANGO_API_PREFIX } from '@/utils/api/tango';

export const authApi = {
  checkEmail: async (email) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/account/check`), { email: email.trim().toLowerCase() });
  },

  login: async (email, password) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/authentication/login`), {
      email: email.trim().toLowerCase(),
      password,
    });
  },

  logout: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/authentication/logout`), {});
  },

  signup: async (email, password) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/account/create`), {
      email: email.trim().toLowerCase(),
      password,
    });
  },

  sendRecoveryRequest: async (email) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/authentication/recovery/request`), {
      email: email.trim().toLowerCase(),
    });
  },

  checkRecoveryToken: async (token) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/authentication/recovery/verify`), { token });
  },

  resetPassword: async (token, userID, password) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/authentication/recovery/update`), {
      token,
      userID,
      password,
    });
  },
};
