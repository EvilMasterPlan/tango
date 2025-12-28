import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VocabCard } from '@/components/quiz/VocabCard';
import './EndOfLesson.scss';

export function EndOfLesson({ lessonResults, vocabDataMap, initialVocabRankings = {}, finalVocabRankings = {} }) {
  console.log(initialVocabRankings, finalVocabRankings);
  const navigate = useNavigate();
  const [phase, setPhase] = useState('start');

  // Get unique vocab IDs from lesson results
  const uniqueVocabIds = [...new Set(
    lessonResults.flatMap(result => result.vocabIds || [])
  )];

  // Get vocab objects for the unique IDs, in the order they appeared
  // Enhance with initial and final ranking states
  const studiedVocab = uniqueVocabIds
    .map(id => {
      const vocab = vocabDataMap[id];
      if (!vocab) return undefined;
      
      // Get initial ranking - if not found, treat as empty (no facets, level 0)
      const initialRanking = initialVocabRankings[id] || {
        lowest: undefined,
        highest: undefined,
        facets: {}
      };
      
      // Get final ranking - use provided finalRanking, fallback to vocab.ranking, or empty
      const finalRanking = finalVocabRankings[id] || vocab.ranking || {
        lowest: undefined,
        highest: undefined,
        facets: {}
      };
      
      return {
        ...vocab,
        initialRanking,
        finalRanking
      };
    })
    .filter(vocab => vocab !== undefined);

  // Phase transitions
  useEffect(() => {
    // Start in phase 1 (start state)
    setPhase('start');
    
    // After a brief delay, transition to phase 2 (animate pips)
    const timer = setTimeout(() => {
      setPhase('animate');
    }, 500); // 500ms delay before starting animations
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinueHome = () => {
    navigate('/');
  };

  console.log(studiedVocab);

  return (
    <div className="lesson-page">
      <main className="lesson-content">
        <div className="end-of-lesson">
          <div className="end-of-lesson-content">
            <h2 className="end-of-lesson-title">Lesson Complete!</h2>
            
            <div className="vocab-cards-container">
              {studiedVocab.length > 0 ? (
                studiedVocab.map((vocab) => (
                  <VocabCard 
                    key={vocab.id} 
                    vocab={vocab}
                    phase={phase}
                    initialRanking={vocab.initialRanking}
                    finalRanking={vocab.finalRanking}
                  />
                ))
              ) : (
                <div className="no-vocab-message">No vocab data available</div>
              )}
            </div>
            
            <button 
              className="action-button continue-button"
              onClick={handleContinueHome}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

