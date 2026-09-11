import { makePostRequest, getUrl } from './common';
import { TANGO_API_PREFIX } from './tango';

export const adminApi = {
  // { days: [{ date: 'yyyy-MM-dd', count }, ...] } — one entry per day with
  // at least one signed-in page view over the last ~year, counting each
  // UserID once per day no matter how many views/pages it made; days with
  // zero are omitted, not zero-filled (see Admin/Dashboard/Page.jsx, which
  // fills the gaps for the calendar) — same shape/timezone reasoning as
  // quizApi.getEffort. Requires the admin role server-side (verifyAdminRole)
  // regardless of whether the caller ever passed RequireAdmin on the
  // frontend.
  getDailyActiveUsers: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/kansatsu/dashboard/daily-active-users`), {
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
  },
  // { days: [{ date: 'yyyy-MM-dd', count }, ...] } — site-wide completed
  // lessons per day (every user, not just one), same shape/window/timezone
  // reasoning as getDailyActiveUsers above.
  getDailyLessonsCompleted: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/kansatsu/dashboard/daily-lessons-completed`), {
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
  },
  // { totalUsers, usersByPlan: { FREE, BETA, PRO }, totalWordsDiscovered,
  // totalLessonsCompleted } — all-time, not windowed by the timeframe
  // dropdown. totalWordsDiscovered counts every (user, word) discovery
  // site-wide, not the catalog's own distinct-word count.
  getOverallStats: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/kansatsu/dashboard/overall-stats`));
  },
  // { users: [{ userID, email, plan, handle, createdAt }, ...] } — first 10
  // accounts whose UserID or Email contains `query`, case-insensitive on
  // both sides. Powers Admin/Spotlight/Page.jsx's search box.
  searchUsers: async (query) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/kansatsu/search-users`), { query });
  },
  // { user: { userID, email, plan, handle, createdAt }, stats: {
  // wordsDiscovered, lessonsCompleted }, eventLogs: [{ eventID, eventType,
  // page, path, search, referer, recordedAt }, ...] } — eventLogs is most
  // recent first, capped server-side. Powers Admin/Spotlight/Detail/
  // Page.jsx, reached by clicking a search-users result card.
  getUserDetails: async (userID) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/kansatsu/user-details`), { userID });
  },
  // { topNotFoundPaths: [{ path, hitCount }, ...], topNotFoundUsers: [{
  // userID, email, hitCount }, ...], topNotFoundIPs: [{ address, hitCount
  // }, ...] } — all three ranked by hitCount descending, over the trailing
  // 30 days. topNotFoundPaths groups by Path alone (query strings don't
  // split a URL into separate rows); topNotFoundUsers/topNotFoundIPs are
  // signed-in/signed-out counterparts of each other. Powers
  // Admin/Security/Page.jsx.
  getSecurityStats: async () => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/kansatsu/security-stats`));
  },
};
