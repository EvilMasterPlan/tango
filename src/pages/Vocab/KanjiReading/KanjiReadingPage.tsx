import { useState, useMemo } from 'react';
import { KanjiReadingCard } from '@/components/KanjiReadingCard';
import { kanjiReadingQuestions } from './kanjiReadingData';

export function KanjiReadingPage() {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});

  // Randomize question order and choice order on each render
  const randomizedQuestions = useMemo(() => {
    return kanjiReadingQuestions
      .map(question => ({
        ...question,
        choices: Object.fromEntries(
          Object.entries(question.choices)
            .sort(() => Math.random() - 0.5)
        )
      }))
      .sort(() => Math.random() - 0.5);
  }, []);

  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  return (
    <div className="vocab-page">
      <h2 className="page-title">Kanji Reading</h2>
      <p className="page-description">
        Master on-yomi and kun-yomi readings for JLPT vocabulary. Practice reading kanji in context.
      </p>
      
      <div className="questions-container">
        {randomizedQuestions.map((question, index) => (
          <KanjiReadingCard
            key={question.question.id}
            question={question}
            questionNumber={index + 1}
            selectedAnswer={selectedAnswers[question.question.id] || null}
            onAnswerSelect={(choiceId) => handleAnswerSelect(question.question.id, choiceId)}
          />
        ))}
      </div>
    </div>
  );
} 