import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header, Footer } from '@/components';
import { Home } from '@/pages/Home';
import { KanjiFocusPage } from '@/pages/Vocab';
import { KanjiFocusPracticePage } from '@/pages/Vocab/KanjiFocus/practice';
import './App.scss';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app">
          <Header />
          
          <main className="main">
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vocab/focus" element={<KanjiFocusPage />} />
                <Route path="/vocab/focus/practice" element={<KanjiFocusPracticePage />} />
              </Routes>
            </div>
          </main>

          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App
