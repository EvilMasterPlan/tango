import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HomeContainer } from '@/pages/Home/Container';
import { LessonContainer } from '@/pages/Lesson/Container';
import '@/App.scss';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app">
          <main className="main">
            <div className="container">
              <Routes>
                <Route path="/" element={<HomeContainer />} />
                <Route path="/lesson" element={<LessonContainer />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App
