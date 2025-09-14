import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { SpellingQuestionBlock } from '@/components/quiz/SpellingQuestionBlock';
import { QuestionBlock } from '@/components/quiz/QuestionBlock';
import { ChoiceGrid } from '@/components/quiz/ChoiceGrid';
import { MatchingQuestionBlock } from '@/components/quiz/MatchingQuestionBlock';

export function Quiz({ questions, api }) {
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSettingsClick = () => {
    // TODO: Implement settings functionality
  };

  const advanceToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHasCheckedAnswer(false);
      setIsQuestionComplete(false);
      setIsQuestionCorrect(false);
    } else {
      navigate('/');
    }
  }, [currentQuestionIndex, questions.length, navigate]);

  const handleSkip = () => {
    if (!hasCheckedAnswer) {
      // Skip without checking - treat as incorrect
      setIsQuestionCorrect(false);
      setHasCheckedAnswer(true);
    } else {
      // Continue after skipping
      advanceToNextQuestion();
    }
  };

  const handleCheck = useCallback(() => {
    console.log(currentQuestion, hasCheckedAnswer, isQuestionCorrect);
    if (!hasCheckedAnswer) {
      // First time checking - correctness is determined by the question component
      setHasCheckedAnswer(true);
      // Record vocab practice for this question
      recordVocabPractice(currentQuestion, isQuestionCorrect);
    } else {
      // Continue after checking (whether correct or incorrect)
      if (currentQuestion.type === 'matching') {
        recordVocabPractice(currentQuestion, true);
      }
      advanceToNextQuestion();
    }
  }, [hasCheckedAnswer, advanceToNextQuestion, isQuestionComplete, currentQuestion.type, currentQuestion, isQuestionCorrect]);

  const handleQuestionCompleteChange = (isComplete) => {
    setIsQuestionComplete(isComplete);
  };

  const handleQuestionCorrectnessChange = (isCorrect) => {
    setIsQuestionCorrect(isCorrect);
  };

  // Record vocab practice when question is first checked
  const recordVocabPractice = async (question, isCorrect) => {
    try {
      // Extract commonly used question properties
      const { id, vocabIds, type, subtype } = question;
      let practiceRecords = [];
      
      if (type === 'matching') {        
        // Check if the question has vocab IDs stored
        if (vocabIds && Array.isArray(vocabIds)) {
          // Create practice records for each vocab ID in the matching question
          practiceRecords = vocabIds.map(vocabId => ({
            vocabId: vocabId,
            type: subtype,
            correct: isCorrect
          }));
        } else {
          console.log('No vocab IDs found in matching question, skipping practice recording');
          return;
        }
      } else if (type === 'choice' || type === 'spelling') {
        // For spelling and choice questions with individual vocab IDs
        practiceRecords = [{
          vocabId: id,
          type: subtype,
          correct: isCorrect
        }];
      } else {
        // Skip other question types
        return;
      }
      
      // Fire-and-forget call - don't await or handle errors
      api.postVocabPracticeRecord(practiceRecords);
    } catch (error) {
      // Silently ignore errors for fire-and-forget behavior
      console.warn('Failed to record vocab practice:', error);
    }
  };

  // Auto-check matching questions when complete
  useEffect(() => {
    if (currentQuestion.type === 'matching' && isQuestionComplete && !hasCheckedAnswer) {
      setHasCheckedAnswer(true);
    }
  }, [currentQuestion.type, isQuestionComplete, hasCheckedAnswer]);

  // Determine if check button should be disabled
  const isCheckDisabled = currentQuestion.type === 'matching'
    ? !isQuestionComplete // For matching: disabled until all matches are made
    : hasCheckedAnswer 
      ? false // Always enabled after checking (to show Continue)
      : !isQuestionComplete;

  // Handle Enter key to trigger Check/Continue button
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        // Check if button should be enabled
        const shouldEnable = currentQuestion.type === 'matching'
          ? isQuestionComplete
          : hasCheckedAnswer ? true : isQuestionComplete;
          
        if (shouldEnable) {
          event.preventDefault();
          handleCheck();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isQuestionComplete, hasCheckedAnswer, currentQuestion.type, handleCheck]);

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
    <div className="lesson-page">
      <LessonHeader 
        current={currentQuestionIndex + 1} 
        total={questions.length} 
        hasCheckedAnswer={hasCheckedAnswer}
        onSettingsClick={handleSettingsClick}
      />

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
  );
}
