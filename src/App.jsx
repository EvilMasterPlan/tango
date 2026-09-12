import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AccountRoutes from '@/pages/account/AccountRoutes';

const MarketingContainer = lazy(() => import('@/pages/Marketing/Container').then(m => ({ default: m.MarketingContainer })));
const HomeContainer = lazy(() => import('@/pages/Home/Container').then(m => ({ default: m.HomeContainer })));
const LessonContainer = lazy(() => import('@/pages/Lesson/Container').then(m => ({ default: m.LessonContainer })));
const DashboardContainer = lazy(() => import('@/pages/Dashboard/Container').then(m => ({ default: m.DashboardContainer })));
const PracticeContainer = lazy(() => import('@/pages/Practice/Container').then(m => ({ default: m.PracticeContainer })));
const ProfileContainer = lazy(() => import('@/pages/Profile/Container').then(m => ({ default: m.ProfileContainer })));
const AdminContainer = lazy(() => import('@/pages/Admin/Container').then(m => ({ default: m.AdminContainer })));
const AdminRadarContainer = lazy(() => import('@/pages/Admin/Radar/Container').then(m => ({ default: m.AdminRadarContainer })));
const AdminDashboardContainer = lazy(() => import('@/pages/Admin/Dashboard/Container').then(m => ({ default: m.AdminDashboardContainer })));
const AdminSpotlightContainer = lazy(() => import('@/pages/Admin/Spotlight/Container').then(m => ({ default: m.AdminSpotlightContainer })));
const AdminSpotlightDetailContainer = lazy(() => import('@/pages/Admin/Spotlight/Detail/Container').then(m => ({ default: m.AdminSpotlightDetailContainer })));
const AdminSecurityContainer = lazy(() => import('@/pages/Admin/Security/Container').then(m => ({ default: m.AdminSecurityContainer })));
const AdminSharpEdgesContainer = lazy(() => import('@/pages/Admin/SharpEdges/Container').then(m => ({ default: m.AdminSharpEdgesContainer })));
const NotFoundContainer = lazy(() => import('@/pages/NotFound/Container').then(m => ({ default: m.NotFoundContainer })));
const LegalPrivacyContainer = lazy(() => import('@/pages/Legal/Privacy/Container').then(m => ({ default: m.LegalPrivacyContainer })));
const LegalTermsContainer = lazy(() => import('@/pages/Legal/Terms/Container').then(m => ({ default: m.LegalTermsContainer })));
const LegalCookiesContainer = lazy(() => import('@/pages/Legal/Cookies/Container').then(m => ({ default: m.LegalCookiesContainer })));
import { UserProvider } from '@/contexts/UserContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import RequireAuth from '@/components/auth/RequireAuth';
import RequireAdmin from '@/components/auth/RequireAdmin';
import { useEventLog } from '@/hooks/useEventLog';
import '@/App.scss';

// Only findable by knowing this exact path — not linked from anywhere in
// the app's own nav, and not a dictionary word an automated guess-list
// would try (unlike e.g. /admin). Not meant to be cryptographically secret
// (this file ships to the browser, so it's trivially recoverable from the
// minified bundle anyway) — just memorable enough for a dev to type;
// RequireAuth + RequireAdmin below are the actual gate (mirrored
// server-side by any admin-only endpoint the hub itself calls — see
// OvermindAPI's tango/admin.js verifyAdminRole).
const ADMIN_HUB_PATH = '/kansatsu';

// Every /kansatsu/* subpage — same RequireAuth + RequireAdmin gate as the
// hub itself (see pages/Admin/Page.jsx's own links to these).
const ADMIN_SUBPAGES = [
  { path: `${ADMIN_HUB_PATH}/radar`, Container: AdminRadarContainer },
  { path: `${ADMIN_HUB_PATH}/dashboard`, Container: AdminDashboardContainer },
  { path: `${ADMIN_HUB_PATH}/spotlight`, Container: AdminSpotlightContainer },
  { path: `${ADMIN_HUB_PATH}/spotlight/:userID`, Container: AdminSpotlightDetailContainer },
  { path: `${ADMIN_HUB_PATH}/security`, Container: AdminSecurityContainer },
  { path: `${ADMIN_HUB_PATH}/sharp-edges`, Container: AdminSharpEdgesContainer },
];

// Needs react-router context (useLocation), so it has to be mounted inside
// <Router> — placed as its own no-op-rendering component rather than called
// straight from App() so that requirement doesn't leak into App's own body.
function PageViewLogger() {
  useEventLog();
  return null;
}

// Shared by the hub and every one of its subpages — factored out so adding
// a new subpage to ADMIN_SUBPAGES above doesn't mean re-typing this same
// RequireAuth/RequireAdmin nesting at every one of its route definitions.
function AdminGate({ children }) {
  return (
    <RequireAuth>
      <RequireAdmin>{children}</RequireAdmin>
    </RequireAuth>
  );
}

function App() {
  return (
    <HelmetProvider>
      <UserProvider>
        <SettingsProvider>
          <Router basename="/tango">
            <PageViewLogger />
            <div className="app">
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<MarketingContainer />} />
                  <Route
                    path="/home"
                    element={
                      <RequireAuth>
                        <HomeContainer />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/lesson"
                    element={
                      <RequireAuth>
                        <LessonContainer />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/overview"
                    element={
                      <RequireAuth>
                        <DashboardContainer />
                      </RequireAuth>
                    }
                  />
                  {/* Collapsed into /overview's mode switcher (see
                      pages/Dashboard) — kept as redirects rather than deleted
                      outright so old bookmarks/links still land somewhere. */}
                  <Route path="/words" element={<Navigate to="/overview" replace />} />
                  <Route path="/effort" element={<Navigate to="/overview?mode=effort" replace />} />
                  <Route path="/achievements" element={<Navigate to="/overview?mode=achievement" replace />} />
                  <Route
                    path="/practice"
                    element={
                      <RequireAuth>
                        <PracticeContainer />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <ProfileContainer />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path={ADMIN_HUB_PATH}
                    element={
                      <AdminGate>
                        <AdminContainer />
                      </AdminGate>
                    }
                  />
                  {ADMIN_SUBPAGES.map(({ path, Container }) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        <AdminGate>
                          <Container />
                        </AdminGate>
                      }
                    />
                  ))}
                  <Route path="/legal/privacy" element={<LegalPrivacyContainer />} />
                  <Route path="/legal/terms" element={<LegalTermsContainer />} />
                  <Route path="/legal/cookies" element={<LegalCookiesContainer />} />
                  <Route
                    path="/account/*"
                    element={
                      <main className="main">
                        <div className="container">
                          <AccountRoutes />
                        </div>
                      </main>
                    }
                  />
                  {/* Must stay last — catches any path none of the routes
                      above matched. useEventLog's own logic already logs a
                      generic 'view' row for this pathname regardless of
                      whether anything rendered (see PageViewLogger, mounted
                      unconditionally above <Routes>) — NotFoundPage adds its
                      own explicit 'not_found' EventType on top of that. */}
                  <Route path="*" element={<NotFoundContainer />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </SettingsProvider>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App
