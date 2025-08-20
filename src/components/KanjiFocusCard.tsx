import React from 'react';
import { ChoiceButton } from './shared/ChoiceButton';
import './shared/card-styles.scss';
import './KanjiFocusCard.scss';

interface Choice {
  id: string;
  text: string;
  correct: boolean;
}

interface KanjiFocusCardProps {
  question: string;
  reading: string;
  definition: string[];
  tags: string[];
  level: string;
  choices: Choice[];
  selectedAnswer: string | null;
  onAnswerSelect: (answerId: string) => void;
  questionNumber?: number;
}

export function KanjiFocusCard({
  question,
  reading,
  definition,
  tags,
  level,
  choices,
  selectedAnswer,
  onAnswerSelect,
  questionNumber
}: KanjiFocusCardProps) {
  return (
    <div className="kanji-focus-card card-base">
      {questionNumber && (
        <div className="question-header">
          <span className="question-number">Question {questionNumber}</span>
        </div>
      )}
      
      <div className="card-header">
        <h2 className="question">{question}</h2>
        <div className="definition">
          {definition.map((def, index) => (
            <p key={index}>{def}</p>
          ))}
        </div>
        <div className="tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
          <span className="level">
            {level}
          </span>
        </div>
      </div>

      <div className="choices">
        {choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choiceId={choice.id}
            choiceText={choice.text}
            choiceNumber={index + 1}
            isSelected={selectedAnswer === choice.id}
            onClick={onAnswerSelect}
          />
        ))}
      </div>
    </div>
  );
} 