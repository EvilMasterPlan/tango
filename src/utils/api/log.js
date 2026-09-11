import { makePostRequest, getUrl } from '@/utils/api/common';
import { TANGO_API_PREFIX } from '@/utils/api/tango';

export const logApi = {
  // Fire-and-forget page view — auth-optional on the backend (see
  // observeSession), so this works the same whether or not the viewer is
  // logged in. `session` is this tab's own view session ID (see
  // utils/viewSession.js) — the backend correlates views into one visit by
  // it, not by anything to do with the authenticated user session.
  // `eventType` (optional) defaults to 'view' server-side — the only other
  // value it accepts today is 'not_found', sent by the catch-all NotFound
  // route (see NotFound/Page.jsx) so a 404 hit is its own queryable
  // EventType instead of just another 'view' row indistinguishable from a
  // real page.
  logEvent: async ({ page, isMobile, session, path, search, eventType }) => {
    return makePostRequest(getUrl(`${TANGO_API_PREFIX}/event/log`), {
      page,
      mobile: isMobile,
      session,
      path,
      search,
      eventType,
    });
  },
};
