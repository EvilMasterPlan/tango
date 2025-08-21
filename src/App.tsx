import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header, Footer } from '@/components';
import { Home } from '@/pages/Home';
import { KanjiReadingPage, OrthographyPage, ExpressionsPage, ParaphrasingPage, KanjiFocusPage } from '@/pages/Vocab';
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
                <Route path="/vocab/reading" element={<KanjiReadingPage />} />
                <Route path="/vocab/orthography" element={<OrthographyPage />} />
                <Route path="/vocab/expressions" element={<ExpressionsPage />} />
                <Route path="/vocab/paraphrasing" element={<ParaphrasingPage />} />
                <Route path="/vocab/focus" element={<KanjiFocusPage />} />
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
