import { Helmet } from 'react-helmet-async';
import { Quiz } from '@/components/quiz/modern/Quiz';

export function TestPage() {
  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Test</title>
        <meta name="description" content="Vocab drill test page" />
      </Helmet>

      <Quiz />
    </>
  );
}
