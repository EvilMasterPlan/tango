import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logApi } from '@/utils/api/log';
import { getViewSessionID } from '@/utils/viewSession';
import { useViewportWidth } from '@/hooks/useViewportWidth';

// Same breakpoint GemChart.scss and others already switch layout at.
const MOBILE_MAX_WIDTH = 768;

// Fire-and-forget page-view logging, one call per route change — mounted
// once near the app root (see App.jsx) rather than per-page, so no
// individual page needs to remember to call this itself. `page` is just the
// route's own pathname; nothing here needs a separate per-page label the
// way otter's PageContainer threads one through.
export function useEventLog() {
  const location = useLocation();
  const width = useViewportWidth();

  useEffect(() => {
    logApi
      .logEvent({
        page: location.pathname,
        isMobile: width <= MOBILE_MAX_WIDTH,
        session: getViewSessionID(),
        path: location.pathname,
        search: location.search,
      })
      .catch(() => {});
    // Deliberately excludes `width`: a page view is logged once per
    // navigation, not re-logged every time the viewport crosses the mobile
    // breakpoint while the user stays on the same page (e.g. rotating a
    // device or resizing a window).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);
}
