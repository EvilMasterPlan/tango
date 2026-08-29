import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MarketingContainer } from '@/pages/Marketing/Container';
import { HomeContainer } from '@/pages/Home/Container';
import { LessonContainer } from '@/pages/Lesson/Container';
import { RadarDebugContainer } from '@/pages/Debug/Radar/Container';
import AccountRoutes from '@/pages/account/AccountRoutes';
import { UserProvider } from '@/contexts/UserContext';
import RequireAuth from '@/components/auth/RequireAuth';
import { TangoAppShell } from '@/components/layout/TangoAppShell';
import '@/App.scss';

function App() {
  return (
    <HelmetProvider>
      <UserProvider>
        <Router basename="/tango">
          <div className="app">
            <Routes>
              <Route path="/" element={<MarketingContainer />} />
              <Route
                path="/home"
                element={
                  <RequireAuth enabled>
                    <TangoAppShell>
                      <HomeContainer />
                    </TangoAppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/lesson"
                element={
                  <RequireAuth enabled>
                    <LessonContainer />
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
      </UserProvider>
    </HelmetProvider>
  );
}

export default App
