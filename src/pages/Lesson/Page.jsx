import { Helmet } from 'react-helmet-async';
import { Quiz } from '@/components/quiz/Quiz';
import '@/pages/Lesson/Page.scss';

export function LessonPage({ questions }) {
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
