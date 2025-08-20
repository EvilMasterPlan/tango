import React from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import type { KanjiQuestion } from '@/types/kanji';
import './shared/card-styles.scss';

interface KanjiReadingCardProps {
  question: KanjiQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerSelect: (choiceId: string) => void;
}

export function KanjiReadingCard({ 
  question, 
  questionNumber, 
  selectedAnswer, 
  onAnswerSelect 
}: KanjiReadingCardProps) {
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