import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { kanjiFocusQuestions } from './kanjiFocusData';
import { KanjiFocusCard } from '@/components/KanjiFocusCard';
import { generateAnswerChoices } from '@/utils/choiceGeneration';

const KanjiFocusPage: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  // Select 10 random questions first, then generate choices only for those
  const questionsWithChoices = useMemo(() => {
    // Filter for questions with "kanji" tag and required fields
    const kanjiQuestions = kanjiFocusQuestions.filter(question => 
      question.tags && 
      question.tags.includes('kanji') &&
      question.reading &&
      question.word
    );
    
    // Extract all readings for generating similar choices
    const allReadings = kanjiQuestions.map(q => q.reading);
    
    // Shuffle and select first 10 questions
    const shuffledQuestions = [...kanjiQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    
    // Generate choices only for the selected questions
    return shuffledQuestions.map(question => ({
      ...question,
      choices: generateAnswerChoices(question.reading, allReadings, {
        similarCount: 2,
        mutationCount: 1,
        originalWord: question.word
      })
    }));
  }, []);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  return (
    <>
      <Helmet>
        <title>Kanji Focus - SarabaJa</title>
        <meta name="description" content="Practice individual kanji characters in isolation with reading and meaning exercises." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Kanji Focus</h1>
        
        <div className="space-y-8">
          {questionsWithChoices.map((question, index) => {
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
    </>
  );
};

export default KanjiFocusPage; 