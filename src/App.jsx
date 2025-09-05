import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Home } from '@/pages/Home/Page';
import { LessonPage } from '@/pages/Lesson/Page';
import '@/App.scss';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app">
          <main className="main">
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lesson" element={<LessonPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App
