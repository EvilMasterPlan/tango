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

  // Generic per-user key/value preference store (TANGO_UserPreferences) —
  // `key`/`value` are just opaque strings as far as this endpoint is
  // concerned; each caller owns its own encoding.
  setPreference: async (key, value) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/preference/set`), { key, value });
  },

  // { activity: [{ at, type }, ...] }, most recent first, capped at 3 —
  // `type` is one of 'Login'/'Logout'/'Reset Request'/'Reset'/'Verify'. See
  // Profile/Page.jsx's security section.
  getActivityHistory: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/activity-history`));
  },

  // Marks the account as having finished the first-run onboarding wizard
  // (see Home/OnboardingOverlay.jsx) — one-way; there's no corresponding
  // "un-onboard" call.
  completeOnboarding: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/complete-onboarding`));
  },

  // Resolves (200) if `handle` could be claimed right now, rejects (409,
  // already taken; 400, bad format) otherwise — never mutates anything. See
  // OnboardingOverlay.jsx's debounced live-availability check.
  checkHandleAvailability: async (handle) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/handle/check`), { handle });
  },

  // Sets the account's @handle — once; rejects 409 if the account already
  // has one, or if `handle` has since been taken by someone else. See the
  // backend's tango/user.js setHandle for why this isn't a general-purpose
  // "change your handle" call.
  setHandle: async (handle) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/me/handle/set`), { handle });
  },
};
