import React from 'react';
import './shared/card-styles.scss';
import './KanjiFocusCard.scss';

interface KanjiFocusCardProps {
  kanji: {
    word: string;
    reading?: string;
    definition: string[];
    tags: string[];
    level: string;
  };
  showAnswer: boolean;
  onShowAnswer: () => void;
}

export function KanjiFocusCard({ kanji, showAnswer, onShowAnswer }: KanjiFocusCardProps) {
  return (
    <div className="kanji-focus-card card-base">
      <div className="card-header">
        <h2 className="kanji-character">{kanji.word}</h2>
        {showAnswer ? (
          <>
            {kanji.reading && (
              <div className="reading">
                <p className="reading-text">{kanji.reading}</p>
              </div>
            )}
            <div className="definition">
              <p>{kanji.definition.join(', ')}</p>
            </div>
            <div className="tags">
              {kanji.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
              <span className="level">
                {kanji.level}
              </span>
            </div>
          </>
        ) : (
          <button 
            onClick={onShowAnswer}
            className="show-answer-btn"
          >
            Show Answer
          </button>
        )}
      </div>
    </div>
  );
} 