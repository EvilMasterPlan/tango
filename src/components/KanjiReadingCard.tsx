import React from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import './shared/card-styles.scss';

export function KanjiReadingCard({ 
  question, 
  questionNumber, 
  selectedAnswer, 
  onAnswerSelect 
}) {
  return (
    <div className="kanji-reading-card">
      <div className="card-header">
        <div className="reading-info">
          <span className="reading">{question.reading}</span>
          <span className="level">{question.level}</span>
        </div>
        <div className="tags">
          {question.tags?.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <QuestionCard
        question={question}
        questionNumber={questionNumber}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
      />
    </div>
  );
} 