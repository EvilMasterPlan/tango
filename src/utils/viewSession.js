const STORAGE_KEY = 'session';

// One random ID per browser tab, persisted in sessionStorage (not
// localStorage) so it survives a reload/navigation within the tab but a new
// tab/window gets its own — same "one ID per visit" scoping event logging
// needs to correlate a visitor's page views without needing them logged in.
// Generated lazily on first call rather than at module load, so a page that
// never logs an event never touches sessionStorage at all. Falls back to a
// fresh (unpersisted) ID if sessionStorage throws (e.g. some browsers'
// private/locked-down modes) — a session ID that resets every call still
// lets that view get logged, just without cross-view correlation.
export function getViewSessionID() {
  try {
    let viewSessionID = sessionStorage.getItem(STORAGE_KEY);
    if (viewSessionID == null) {
      viewSessionID = crypto.randomUUID();
      sessionStorage.setItem(STORAGE_KEY, viewSessionID);
    }
    return viewSessionID;
  } catch {
    return crypto.randomUUID();
  }
}
