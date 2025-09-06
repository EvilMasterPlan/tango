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
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);
  const [isSpellingComplete, setIsSpellingComplete] = useState(false);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [currentSpelling, setCurrentSpelling] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

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
    if (!hasCheckedAnswer) {
      // First time checking - validate the answer
      let isCorrect = false;
      
      if (currentQuestion.type === 'choice') {
        const selectedChoice = currentQuestion.choices[selectedChoiceIndex];
        isCorrect = selectedChoice === currentQuestion.answer;
      } else if (currentQuestion.type === 'matching') {
        // Compare matching answers array with the correct answers
        isCorrect = JSON.stringify(matchingAnswers) === JSON.stringify(currentQuestion.answers);
      } else {
        // spelling type
        isCorrect = currentSpelling === currentQuestion.answer;
      }
      
      setIsAnswerCorrect(isCorrect);
      setHasCheckedAnswer(true);
    } else {
      // Continue after checking (whether correct or incorrect)
      advanceToNextQuestion();
    }
  };

  const advanceToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoiceIndex(null);
      setIsSpellingComplete(false);
      setHasCheckedAnswer(false);
      setIsAnswerCorrect(false);
      setCurrentSpelling('');
      setMatchingAnswers([]);
      setSelectedSource(null);
      setSelectedDestination(null);
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

  const handleSpellingChange = (spelling) => {
    setCurrentSpelling(spelling);
  };

  const handleMatchingSelect = (type, index) => {
    if (hasCheckedAnswer) return; // Don't allow changes after checking
    
    // Don't allow selection of already matched items
    if (type === 'source' && matchingAnswers[index] !== undefined) return;
    if (type === 'destination' && matchingAnswers.some(answer => answer === index)) return;
    
    if (type === 'source') {
      if (selectedSource === index) {
        // Clicking same source - deselect it
        setSelectedSource(null);
      } else {
        // Select new source
        setSelectedSource(index);
        
        // If we have both source and destination selected, create match
        if (selectedDestination !== null) {
          const newAnswers = [...matchingAnswers];
          newAnswers[index] = selectedDestination;
          setMatchingAnswers(newAnswers);
          setSelectedSource(null);
          setSelectedDestination(null);
        }
      }
    } else if (type === 'destination') {
      if (selectedDestination === index) {
        // Clicking same destination - deselect it
        setSelectedDestination(null);
      } else {
        // Select new destination
        setSelectedDestination(index);
        
        // If we have both source and destination selected, create match
        if (selectedSource !== null) {
          const newAnswers = [...matchingAnswers];
          newAnswers[selectedSource] = index;
          setMatchingAnswers(newAnswers);
          setSelectedSource(null);
          setSelectedDestination(null);
        }
      }
    }
  };

  // Determine if check button should be disabled
  const isCheckDisabled = hasCheckedAnswer 
    ? false // Always enabled after checking (to show Continue)
    : currentQuestion.type === 'choice' 
      ? selectedChoiceIndex === null
      : currentQuestion.type === 'matching'
        ? matchingAnswers.length !== currentQuestion.choices.sources.length || matchingAnswers.some(answer => answer === undefined)
        : !isSpellingComplete;

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
          question={{ text: currentQuestion.question }}
          reading={currentQuestion.answer}
          choices={currentQuestion.choices}
          onCompletionChange={handleSpellingCompletionChange}
          onSpellingChange={handleSpellingChange}
          disabled={isDisabled}
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          correctAnswer={currentQuestion.answer}
        />
      );
    } else if (currentQuestion.type === 'matching') {
      return (
        <MatchingQuestionBlock 
          question={{ subtype: currentQuestion.subtype }}
          sources={currentQuestion.choices.sources}
          destinations={currentQuestion.choices.destinations}
          disabled={isDisabled}
          hasCheckedAnswer={hasCheckedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          matchingAnswers={matchingAnswers}
          onMatchingSelect={handleMatchingSelect}
          correctAnswers={currentQuestion.answers}
          selectedSource={selectedSource}
          selectedDestination={selectedDestination}
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
            disabled={isDisabled}
            hasCheckedAnswer={hasCheckedAnswer}
            isAnswerCorrect={isAnswerCorrect}
            correctAnswer={currentQuestion.answer}
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
          isAnswerIncorrect={hasCheckedAnswer && !isAnswerCorrect}
          correctAnswer={currentQuestion.answer}
          questionType={currentQuestion.type}
        />
      </div>
    </>
  );
}
