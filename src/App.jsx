import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MarketingContainer } from '@/pages/Marketing/Container';
import { HomeContainer } from '@/pages/Home/Container';
import { LessonContainer } from '@/pages/Lesson/Container';
import { OverviewContainer } from '@/pages/Overview/Container';
import { PracticeContainer } from '@/pages/Practice/Container';
import { EffortContainer } from '@/pages/Effort/Container';
import { AchievementsContainer } from '@/pages/Achievements/Container';
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
                  path="/words"
                  element={
                    <RequireAuth>
                      <OverviewContainer />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/practice"
                  element={
                    <RequireAuth>
                      <PracticeContainer />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/effort"
                  element={
                    <RequireAuth>
                      <EffortContainer />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <RequireAuth>
                      <AchievementsContainer />
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
