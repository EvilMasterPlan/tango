import { getTierName } from '@/constants/tierColors';
import { QuestionSubtype } from '@/utils/questionTypes';
import { CSSTransition } from 'react-transition-group';
import './VocabCard.scss';

// Fallback to all question types if questionTypes is not provided
const ALL_QUESTION_SUBTYPES = [
  QuestionSubtype.WORD_TO_SPELLING,
  QuestionSubtype.WORD_TO_MEANING,
  QuestionSubtype.WORD_TO_READING,
  QuestionSubtype.MEANING_TO_WORD
];

export function VocabCard({ vocab, phase = 'start', initialRanking = null, finalRanking = null }) {
  if (!vocab) return null;

  // Use initial ranking for phase 1, final ranking for phase 2+
  // If initialRanking is null/undefined, treat as empty (no facets, level 0)
  let ranking;
  if (phase === 'start') {
    ranking = initialRanking || { lowest: undefined, highest: undefined, facets: {} };
  } else {
    ranking = finalRanking || vocab.ranking || {};
  }
  
  const rankLevel = ranking.lowest !== undefined ? ranking.lowest + 1 : 0;
  const facets = ranking.facets || {};
  const tierName = getTierName(rankLevel);
  const tierClass = `tier-${tierName}`;

  const word = vocab.word;
  
  // Use vocab's questionTypes if available, otherwise fall back to all types
  // Sort alphabetically to ensure consistent ordering
  const questionTypes = (vocab.questionTypes || ALL_QUESTION_SUBTYPES).slice().sort();
  
  // Determine which pips should animate (empty at start, now lit)
  const initialFacets = initialRanking?.facets || {};
  const finalFacets = finalRanking?.facets || {};

  return (
    <div className={`vocab-card ${tierClass}`}>
      <div className="vocab-card-word">{word}</div>
      <div className="vocab-card-tier-section">
        <div className="vocab-card-tier">Level {rankLevel}</div>
        <div className="vocab-card-progress">
          <div className="progress-grid">
            {questionTypes.map((subtype, index) => {
              // Convert subtype from "meaning to word" to "meaning_to_word" to match facet keys
              const facetKey = subtype.replace(/\s+/g, '_').toLowerCase();
              
              // Check initial and final states to determine animation behavior
              const initialLevel = initialFacets[facetKey];
              const finalLevel = finalFacets[facetKey];
              const wasAlreadyLit = initialLevel !== undefined && initialLevel > 0;
              const shouldAnimate = (initialLevel === undefined || initialLevel === 0) && 
                                    (finalLevel !== undefined && finalLevel > 0);
              
              // For pips that should animate, use CSSTransition
              if (shouldAnimate) {
                return (
                  <CSSTransition
                    key={subtype}
                    in={phase === 'animate'}
                    timeout={600}
                    classNames="pip"
                  >
                    <div
                      className="progress-cell"
                      title={subtype}
                    />
                  </CSSTransition>
                );
              }
              
              // For already-lit or unlit pips, render directly without transition
              return (
                <div 
                  key={subtype}
                  className={`progress-cell ${wasAlreadyLit ? 'was-already-lit' : ''}`}
                  title={subtype}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

