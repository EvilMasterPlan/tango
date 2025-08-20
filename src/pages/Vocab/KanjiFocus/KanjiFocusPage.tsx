import React, { useState, useMemo } from 'react';
import { kanjiFocusQuestions } from './kanjiFocusData';
import { KanjiFocusCard } from '@/components/KanjiFocusCard';
import { generateAnswerChoices } from '@/utils/choiceGeneration';

const KanjiFocusPage: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  // Extract all readings from questions for generating similar choices
  const allReadings = useMemo(() => {
    return kanjiFocusQuestions.map(q => q.reading);
  }, []);

  // Generate choices for each question
  const questionsWithChoices = useMemo(() => {
    return kanjiFocusQuestions.map(question => ({
      ...question,
      choices: generateAnswerChoices(question.reading, allReadings, {
        similarCount: 2,
        mutationCount: 1,
        originalWord: question.word
      })
    }));
  }, [allReadings]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Kanji Focus</h1>
        
        <div className="space-y-8">
          {questionsWithChoices.slice(0, 10).map((question, index) => {
            const selectedAnswer = answers[question.id];

            return (
              <div key={question.id} className="border-b border-gray-200 pb-8">
                <KanjiFocusCard
                  question={question.word}
                  reading={question.reading}
                  definition={question.definition}
                  tags={question.tags}
                  level={question.level}
                  choices={question.choices}
                  selectedAnswer={selectedAnswer}
                  onAnswerSelect={(answerId) => handleAnswerSelect(question.id, answerId)}
                  questionNumber={index + 1}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanjiFocusPage; 