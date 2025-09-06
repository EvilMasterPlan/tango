import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { SpellingQuestionBlock } from '@/components/quiz/SpellingQuestionBlock';
import '@/pages/Lesson/Page.scss';

export function LessonPage() {
  // Hardcoded question data
  const questionData = {
    word_id: "W_001",
    type: "word to spelling",
    question: { text: "浴びる" },
    reading: "あびる",
    choices: [
      "あ",
      "び",
      "る",
      "お",
      "い",
      "ひ",
    ],
  };

  const handleSettingsClick = () => {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  };

  const handleSkip = () => {
    // TODO: Implement skip functionality
    console.log('Skip clicked');
  };

  const handleCheck = () => {
    // TODO: Implement check functionality
    console.log('Check clicked');
  };

  return (
    <>
      <Helmet>
        <title>Lesson - SarabaJa</title>
        <meta name="description" content="Japanese vocabulary lesson" />
      </Helmet>
      
      <div className="lesson-page">
        <LessonHeader 
          current={7} 
          total={20} 
          onSettingsClick={handleSettingsClick}
        />

        {/* B - Main Content */}
        <main className="lesson-content">
          <div className="question-area">
            <SpellingQuestionBlock 
              question={questionData.question}
              reading={questionData.reading}
              choices={questionData.choices}
            />
          </div>
        </main>

        <LessonFooter 
          onSkip={handleSkip}
          onCheck={handleCheck}
        />
      </div>
    </>
  );
}
