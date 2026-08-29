import { Helmet } from 'react-helmet-async';
import { Quiz } from '@/components/quiz/Quiz';

export function LessonPage() {
  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Lesson</title>
        <meta name="description" content="Japanese vocabulary lesson" />
      </Helmet>

      <Quiz />
    </>
  );
}
