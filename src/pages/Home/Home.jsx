import { Helmet } from 'react-helmet-async';
import './Home.scss';

export function Home() {
  return (
    <>
      <Helmet>
        <title>SarabaJa - Japanese Learning Platform</title>
        <meta name="description" content="Master Japanese kanji, vocabulary, and JLPT preparation with personalized study plans." />
      </Helmet>
    </>
  );
}
