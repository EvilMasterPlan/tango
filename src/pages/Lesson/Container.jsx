import { useState, useEffect } from 'react';
import { api } from '@/utils/api/tango';
import { useApiCall } from '@/utils/api/common';
import { LessonPage } from './Page';

export function LessonContainer() {
  const { isLoading: isLoadingPractice, data: dataPractice } = useApiCall(api.getAllVocabPractice);
  const { isLoading: isLoadingLesson, error: errorLesson, data: dataLesson } = useApiCall(api.postVocabLessonGenerate);
  const [questions, setQuestions] = useState([]);

  // Generate questions when vocab data is available
  useEffect(() => {
    if (dataLesson) {
      const newQuestions = dataLesson.questions;
      setQuestions(newQuestions);
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

  return <LessonPage questions={questions} api={api} />;
}
