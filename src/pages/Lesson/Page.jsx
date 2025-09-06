import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { SpellingQuestionBlock } from '@/components/quiz/SpellingQuestionBlock';
import { QuestionBlock } from '@/components/quiz/QuestionBlock';
import { ChoiceGrid } from '@/components/quiz/ChoiceGrid';
import { MatchingQuestionBlock } from '@/components/quiz/MatchingQuestionBlock';
import '@/pages/Lesson/Page.scss';

export function LessonPage() {
  const navigate = useNavigate();
  
  // Hardcoded questions data
  const questions = [
    {
      type: "matching",
      subtype: "word to meaning",
      answers: [0, 1, 2, 3, 4],
      choices: {
        sources: [
          "浴びる",
          "危ない",
          "あっち",
          "あちら",
          "上げる",
        ],
        destinations: [
          "to bathe",
          "dangerous",
          "over there",
          "there",
          "to raise",
        ],
      },
    },
    {
      word_id: "W_001",
      type: "choice",
      subtype: "kanji to reading",
      question: "浴びる",
      answer: "あびる",
      choices: ["あびる", "あばる", "おびる", "いひる"],
    },
    {
      word_id: "W_001",
      type: "choice",
      subtype: "word to meaning",
      question: "浴びる",
      answer: "to bathe",
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
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSettingsClick = () => {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  };

  const handleSkip = () => {
    if (!hasCheckedAnswer) {
      // Skip without checking - treat as incorrect
      setIsAnswerCorrect(false);
      setHasCheckedAnswer(true);
    } else {
      // Continue after skipping
      advanceToNextQuestion();
    }
  };

  const handleCheck = () => {
    if (currentQuestion.type === 'matching') {
      // For matching questions, always proceed to next question
      advanceToNextQuestion();
    } else if (!hasCheckedAnswer) {
      // First time checking - correctness is determined by the question component
      setHasCheckedAnswer(true);
    } else {
      // Continue after checking (whether correct or incorrect)
      advanceToNextQuestion();
    }
  };

  const advanceToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHasCheckedAnswer(false);
      setIsQuestionComplete(false);
      setIsQuestionCorrect(false);
    } else {
      navigate('/');
    }
  };

  const handleQuestionCompleteChange = (isComplete) => {
    setIsQuestionComplete(isComplete);
  };

  const handleQuestionCorrectnessChange = (isCorrect) => {
    setIsQuestionCorrect(isCorrect);
  };

  // Determine if check button should be disabled
  const isCheckDisabled = currentQuestion.type === 'matching'
    ? !isQuestionComplete // For matching: disabled until all matches are made
    : hasCheckedAnswer 
      ? false // Always enabled after checking (to show Continue)
      : !isQuestionComplete;

  // Handle Enter key to trigger Check/Continue button
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !isCheckDisabled) {
        event.preventDefault();
        handleCheck();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isCheckDisabled, hasCheckedAnswer]);

  const renderQuestion = () => {
    const isDisabled = hasCheckedAnswer; // Disable all choices once checked, regardless of correctness
    
    if (currentQuestion.type === 'spelling') {
      return (
        <SpellingQuestionBlock 
          key={currentQuestionIndex}
          question={{ text: currentQuestion.question }}
          reading={currentQuestion.answer}
          choices={currentQuestion.choices}
          disabled={isDisabled}
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerCorrect={isQuestionCorrect}
          correctAnswer={currentQuestion.answer}
          onCompleteChange={handleQuestionCompleteChange}
          onCorrectnessChange={handleQuestionCorrectnessChange}
        />
      );
    } else if (currentQuestion.type === 'matching') {
      return (
        <MatchingQuestionBlock 
          key={currentQuestionIndex}
          question={{ subtype: currentQuestion.subtype }}
          sources={currentQuestion.choices.sources}
          destinations={currentQuestion.choices.destinations}
          disabled={isDisabled}
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerCorrect={isQuestionCorrect}
          correctAnswers={currentQuestion.answers}
          onCompleteChange={handleQuestionCompleteChange}
          onCorrectnessChange={handleQuestionCorrectnessChange}
        />
      );
    } else {
      return (
        <div className="choice-question">
          <QuestionBlock question={{ text: currentQuestion.question }} />
          <ChoiceGrid 
            key={currentQuestionIndex}
            choices={currentQuestion.choices}
            disabled={isDisabled}
            hasCheckedAnswer={hasCheckedAnswer}
            isAnswerCorrect={isQuestionCorrect}
            correctAnswer={currentQuestion.answer}
            onCompleteChange={handleQuestionCompleteChange}
            onCorrectnessChange={handleQuestionCorrectnessChange}
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
          hasCheckedAnswer={hasCheckedAnswer}
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
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerIncorrect={hasCheckedAnswer && !isQuestionCorrect}
          correctAnswer={currentQuestion.answer}
          questionType={currentQuestion.type}
          isMatchingQuestion={currentQuestion.type === 'matching'}
        />
      </div>
    </>
  );
}
