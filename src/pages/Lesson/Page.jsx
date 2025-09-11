import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Quiz } from '@/components/quiz/Quiz';
import { generateLesson } from '@/utils/lessonGeneration';
import '@/pages/Lesson/Page.scss';

export function LessonPage() {
  // Generate questions once when component mounts
  const [questions] = useState(() => generateLesson({
    numWords: 10,
    numMatchingQuestions: 2,
    numSpellingQuestions: 5
  }));

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Lesson</title>
        <meta name="description" content="Japanese vocabulary lesson" />
      </Helmet>
      
      <Quiz questions={questions} />
    </>
  );
}
