import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/utils/api/tango';
import { useApiCall } from '@/utils/api/common';
import { LessonPage } from './Page';

export function LessonContainer() {
  const [searchParams] = useSearchParams();
  const tagID = searchParams.get('tagID');
  
  const { isLoading: isLoadingLesson, error: errorLesson, data: dataLesson } = useApiCall(() => 
    api.postVocabLessonGenerate(tagID ? [tagID] : [])
  );
  const [questions, setQuestions] = useState([]);
  const [vocabDataMap, setVocabDataMap] = useState({});

  // Generate questions and extract vocab data when lesson data is available
  useEffect(() => {
    if (dataLesson) {
      const newQuestions = dataLesson.questions;
      setQuestions(newQuestions);
      
      // Extract vocab data from questions
      const vocabMap = {};
      newQuestions.forEach(question => {
        if (question.vocab && question.vocab.id) {
          if (!vocabMap[question.vocab.id]) {
            vocabMap[question.vocab.id] = question.vocab;
          }
        }
      });
      setVocabDataMap(vocabMap);
    }
  }, [dataLesson]);

  // Don't render until everything is ready
  if (isLoadingLesson || questions.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (errorLesson) {
    return (
      <div className="error-container">
        <div className="error-message">Failed to load lesson data</div>
      </div>
    );
  }

  return <LessonPage questions={questions} vocabDataMap={vocabDataMap} api={api} />;
}
