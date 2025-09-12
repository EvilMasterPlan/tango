import { useState, useEffect } from 'react';
import { api } from '@/utils/api/tango';
import { useApiCall } from '@/utils/api/common';
import { generateLesson } from '@/utils/lessonGeneration';
import { LessonPage } from './Page';

export function LessonContainer() {
  const { isLoading, error, data } = useApiCall(api.getAllVocab);
  const [questions, setQuestions] = useState([]);

  // Generate questions when vocab data is available
  useEffect(() => {
    if (data) {
      
      // Extract vocab array from the response object
      const vocabArray = data.vocab;
      
      if (!Array.isArray(vocabArray) || vocabArray.length === 0) {
        console.warn('No vocab data available or not an array:', vocabArray);
        return;
      }

      const vocabSample = vocabArray.sort(() => Math.random() - 0.5).slice(0, 10);
      
       const newQuestions = generateLesson(vocabSample, {
         numMatchingQuestions: 2,
         numSpellingQuestions: 5
       });
      setQuestions(newQuestions);
    }
  }, [data]);

  // Don't render until everything is ready
  if (isLoading || questions.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Failed to load lesson data</div>
      </div>
    );
  }

  return <LessonPage questions={questions} />;
}
