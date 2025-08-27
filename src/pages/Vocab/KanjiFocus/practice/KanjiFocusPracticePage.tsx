import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { KanjiFocusCard } from '@/components/KanjiFocusCard';
import { kanjiFocusQuestions } from '../kanjiFocusData';

export default function KanjiFocusPracticePage() {
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentKanji = kanjiFocusQuestions[currentKanjiIndex];

  const handleNext = () => {
    setCurrentKanjiIndex((prev) => (prev + 1) % kanjiFocusQuestions.length);
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    setCurrentKanjiIndex((prev) => 
      prev === 0 ? kanjiFocusQuestions.length - 1 : prev - 1
    );
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * kanjiFocusQuestions.length);
    setCurrentKanjiIndex(randomIndex);
    setShowAnswer(false);
  };

  return (
    <>
      <Helmet>
        <title>Kanji Focus Practice - SarabaJa</title>
        <meta name="description" content="Practice individual kanji characters in isolation" />
      </Helmet>
      
      <div className="kanji-focus-container kanji-focus-practice">
        <header className="kanji-focus-header">
          <h1>Kanji Focus Practice</h1>
          <p>Practice individual kanji characters in isolation</p>
        </header>

        <div className="kanji-focus-content">
          <KanjiFocusCard
            kanji={currentKanji}
            showAnswer={showAnswer}
            onShowAnswer={handleShowAnswer}
          />

          <div className="kanji-focus-controls">
            <button 
              onClick={handlePrevious}
              className="control-btn control-btn-secondary"
            >
              Previous
            </button>
            
            <button 
              onClick={handleRandom}
              className="control-btn control-btn-secondary"
            >
              Random
            </button>
            
            <button 
              onClick={handleNext}
              className="control-btn control-btn-primary"
            >
              Next
            </button>
          </div>

          <div className="kanji-focus-progress">
            <span>
              {currentKanjiIndex + 1} of {kanjiFocusQuestions.length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
