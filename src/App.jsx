import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home/Home';
import KanjiFocusPage from '@/pages/Vocab/KanjiFocus/KanjiFocusPage';
import KanjiFocusPracticePage from '@/pages/Vocab/KanjiFocus/practice/KanjiFocusPracticePage';
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
