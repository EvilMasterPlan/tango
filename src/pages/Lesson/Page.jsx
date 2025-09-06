import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { SpellingQuestionBlock } from '@/components/quiz/SpellingQuestionBlock';
import { QuestionBlock } from '@/components/quiz/QuestionBlock';
import { ChoiceGrid } from '@/components/quiz/ChoiceGrid';
import '@/pages/Lesson/Page.scss';

export function LessonPage() {
  const navigate = useNavigate();
  
  // Hardcoded questions data
  const questions = [
    {
      word_id: "W_001",
      type: "choice",
      subtype: "kanji to reading",
      question: "浴びる",
      choices: ["あびる", "あばる", "おびる", "いひる"],
    },
    {
      word_id: "W_001",
      type: "choice",
      subtype: "word to meaning",
      question: "浴びる",
      choices: ["to bathe", "to lie", "to eat", "to sleep"],
    },
    {
      word_id: "W_001",
      type: "choice",
      subtype: "meaning to word",
      question: "to bathe",
      answer: "浴びる",
      choices: ["浴びる", "峪びる", "郤びる", "欲びる"],
    },
    {
      word_id: "W_001",
      type: "spelling",
      subtype: "word to spelling",
      question: "浴びる",
      answer: "あびる",
      choices: ["あ", "び", "る", "お", "い", "ひ"],
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);
  const [isSpellingComplete, setIsSpellingComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSettingsClick = () => {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  };

  const handleSkip = () => {
    // TODO: Implement skip functionality
    console.log('Skip clicked');
  };

  const handleCheck = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoiceIndex(null);
      setIsSpellingComplete(false);
    } else {
      navigate('/');
    }
  };

  const handleChoiceSelect = (choice, index) => {
    setSelectedChoiceIndex(index);
  };

  const handleSpellingCompletionChange = (isComplete) => {
    setIsSpellingComplete(isComplete);
  };

  // Determine if check button should be disabled
  const isCheckDisabled = currentQuestion.type === 'choice' 
    ? selectedChoiceIndex === null
    : !isSpellingComplete;

  const renderQuestion = () => {
    if (currentQuestion.type === 'spelling') {
      return (
        <SpellingQuestionBlock 
          question={{ text: currentQuestion.question }}
          reading={currentQuestion.answer}
          choices={currentQuestion.choices}
          onCompletionChange={handleSpellingCompletionChange}
        />
      );
    } else {
      return (
        <div className="choice-question">
          <QuestionBlock question={{ text: currentQuestion.question }} />
          <ChoiceGrid 
            choices={currentQuestion.choices}
            selectedIndex={selectedChoiceIndex}
            onChoiceSelect={handleChoiceSelect}
          />
        </div>
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Lesson - SarabaJa</title>
        <meta name="description" content="Japanese vocabulary lesson" />
      </Helmet>
      
      <div className="lesson-page">
        <LessonHeader 
          current={currentQuestionIndex + 1} 
          total={questions.length} 
          onSettingsClick={handleSettingsClick}
        />

        {/* B - Main Content */}
        <main className="lesson-content">
          <div className="question-area">
            {renderQuestion()}
          </div>
        </main>

        <LessonFooter 
          onSkip={handleSkip}
          onCheck={handleCheck}
          checkDisabled={isCheckDisabled}
        />
      </div>
    </>
  );
}
