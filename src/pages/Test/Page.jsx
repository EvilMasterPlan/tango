import { Helmet } from 'react-helmet-async';
import { Quiz } from '@/components/quiz/modern/Quiz';
import '@/pages/Test/Page.scss';

export function TestPage() {
  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Test</title>
        <meta name="description" content="Vocab drill test page" />
      </Helmet>

      <div className="test-page">
        <Quiz />
      </div>
    </>
  );
}
