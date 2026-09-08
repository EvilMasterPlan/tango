// Mirrors the backend's src/tango/planAccess.js — PRO and BETA carry
// identical access rights everywhere; BETA is only a distinct label for
// comped/beta-testing accounts, not a different tier of access. A
// missing/unrecognized plan (e.g. still loading, or a stale cached profile)
// reads as no access, same as an explicit 'FREE'.
export const FREE_JLPT_LEVEL = 'N5';

export function hasFullAccess(user) {
  return user?.plan === 'PRO' || user?.plan === 'BETA';
}
