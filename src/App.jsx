import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MarketingContainer } from '@/pages/Marketing/Container';
import { HomeContainer } from '@/pages/Home/Container';
import { LessonContainer } from '@/pages/Lesson/Container';
import { DashboardContainer } from '@/pages/Dashboard/Container';
import { PracticeContainer } from '@/pages/Practice/Container';
import { ProfileContainer } from '@/pages/Profile/Container';
import { RadarDebugContainer } from '@/pages/Debug/Radar/Container';
import AccountRoutes from '@/pages/account/AccountRoutes';
import { UserProvider } from '@/contexts/UserContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import RequireAuth from '@/components/auth/RequireAuth';
import { useEventLog } from '@/hooks/useEventLog';
import '@/App.scss';

// Needs react-router context (useLocation), so it has to be mounted inside
// <Router> — placed as its own no-op-rendering component rather than called
// straight from App() so that requirement doesn't leak into App's own body.
function PageViewLogger() {
  useEventLog();
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <UserProvider>
        <SettingsProvider>
          <Router basename="/tango">
            <PageViewLogger />
            <div className="app">
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
                <Route path="/debug/radar" element={<RadarDebugContainer />} />
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
              </Routes>
            </div>
          </Router>
        </SettingsProvider>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App
