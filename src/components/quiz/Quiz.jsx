import { useState, useEffect, useRef } from 'react';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { SpellingQuestionBlock } from '@/components/quiz/SpellingQuestionBlock';
import { QuestionBlock } from '@/components/quiz/QuestionBlock';
import { ChoiceGrid } from '@/components/quiz/ChoiceGrid';
import { MatchingQuestionBlock } from '@/components/quiz/MatchingQuestionBlock';
import { FeedbackOverlay } from '@/components/quiz/FeedbackOverlay';
import { EndOfLesson } from '@/components/quiz/EndOfLesson';

export function Quiz({ questions, vocabDataMap, api }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState(false);
  const [lessonResults, setLessonResults] = useState([]);
  const [isLessonComplete, setIsLessonComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const hasRecordedPractice = useRef(false);
  
  // Capture initial vocab ranking state at lesson start
  const initialVocabRankings = useRef(null);
  
  useEffect(() => {
    if (vocabDataMap && !initialVocabRankings.current) {
      // Deep copy the initial ranking state for each vocab
      // Include all vocabs, even if they have no ranking (treat as empty)
      const initialRankings = {};
      Object.keys(vocabDataMap).forEach(vocabId => {
        const vocab = vocabDataMap[vocabId];
        if (vocab) {
          if (vocab.ranking) {
            initialRankings[vocabId] = {
              lowest: vocab.ranking.lowest,
              highest: vocab.ranking.highest,
              facets: vocab.ranking.facets ? { ...vocab.ranking.facets } : {}
            };
          } else {
            // Capture empty ranking for vocabs with no ranking yet
            initialRankings[vocabId] = {
              lowest: undefined,
              highest: undefined,
              facets: {}
            };
          }
        }
      });
      initialVocabRankings.current = initialRankings;
    }
  }, [vocabDataMap]);

  const handleSettingsClick = () => {
    // TODO: Implement settings functionality
  };

  const advanceToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHasCheckedAnswer(false);
      setIsQuestionComplete(false);
      setIsQuestionCorrect(false);
      hasRecordedPractice.current = false; // Reset practice recording flag
    } else {
      setIsLessonComplete(true);
    }
  };

  const handleSkip = () => {
    if (!hasCheckedAnswer) {
      // Skip without checking - record locally for EoL stats but don't make API call
      hasRecordedPractice.current = true; // Mark as recorded to prevent duplicates
      recordQuestionResult(currentQuestion, false, true);
      // Advance immediately without showing feedback
      advanceToNextQuestion();
    } else {
      // Continue after skipping
      advanceToNextQuestion();
    }
  };

  const handleCheck = () => {
    if (!hasCheckedAnswer) {
      // First time checking - just show feedback, don't record practice yet
      setHasCheckedAnswer(true);
    } else {
      // Continue after checking (whether correct or incorrect)
      advanceToNextQuestion();
    }
  };

  const handleQuestionCompleteChange = (isComplete) => {
    setIsQuestionComplete(isComplete);
    
    // Auto-check matching questions when complete
    if (currentQuestion.type === 'matching' && isComplete && !hasCheckedAnswer) {
      setHasCheckedAnswer(true);
    }
  };

  const handleQuestionCorrectnessChange = (isCorrect) => {
    console.log('Correctness change called:', { isCorrect, hasCheckedAnswer, currentQuestionIndex, hasRecorded: hasRecordedPractice.current });
    setIsQuestionCorrect(isCorrect);
    
    // Record practice when correctness is determined (only once per question)
    if (hasCheckedAnswer && !hasRecordedPractice.current) {
      hasRecordedPractice.current = true;
      recordVocabPractice(currentQuestion, isCorrect);
      recordQuestionResult(currentQuestion, isCorrect, false);
    }
  };

  // Record question result for end-of-lesson summary
  const recordQuestionResult = (question, isCorrect, skipped) => {
    const { id, vocabIds, type, subtype } = question;
    
    // Extract vocab IDs - for matching questions use vocabIds array, otherwise use single id
    const resultVocabIds = type === 'matching' && vocabIds && Array.isArray(vocabIds)
      ? vocabIds
      : id ? [id] : [];
    
    // Skip if no vocab IDs found
    if (resultVocabIds.length === 0) {
      console.warn('No vocab IDs found in question, skipping result recording', question);
      return;
    }
    
    const result = {
      vocabIds: resultVocabIds,
      type,
      subtype: subtype || null,
      correct: isCorrect,
      skipped
    };
    
    setLessonResults(prev => [...prev, result]);
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

  // Determine if check button should be disabled
  const isCheckDisabled = currentQuestion.type === 'matching'
    ? !isQuestionComplete // For matching: disabled until all matches are made
    : hasCheckedAnswer 
      ? false // Always enabled after checking (to show Continue)
      : !isQuestionComplete;

  // Handle Enter key globally - only useEffect we need
  useEffect(() => {
    const handleKeyDown = (event) => {
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion.type, isQuestionComplete, hasCheckedAnswer]);

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

  // Calculate final rankings from initial rankings + lesson results
  const calculateFinalRankings = () => {
    const initial = initialVocabRankings.current || {};
    const final = {};
    
    // Start with initial rankings
    Object.keys(initial).forEach(vocabId => {
      final[vocabId] = {
        lowest: initial[vocabId].lowest,
        highest: initial[vocabId].highest,
        facets: { ...initial[vocabId].facets }
      };
    });
    
    // Process lesson results to update rankings
    lessonResults.forEach(result => {
      if (!result.correct || result.skipped) return; // Only count correct answers
      
      const { vocabIds, subtype } = result;
      if (!vocabIds || !subtype) return;
      
      // Convert subtype to facet key
      const facetKey = subtype.replace(/\s+/g, '_').toLowerCase();
      
      vocabIds.forEach(vocabId => {
        // Initialize if not in final rankings
        if (!final[vocabId]) {
          final[vocabId] = {
            lowest: undefined,
            highest: undefined,
            facets: {}
          };
        }
        
        // Increment facet value for correct answers
        const currentValue = final[vocabId].facets[facetKey] || 0;
        final[vocabId].facets[facetKey] = currentValue + 1;
        
        // Update highest (max of all facets)
        const facetValues = Object.values(final[vocabId].facets);
        final[vocabId].highest = facetValues.length > 0 ? Math.max(...facetValues) : undefined;
        
        // Update lowest (min of all facets that are > 0)
        const positiveFacets = facetValues.filter(v => v > 0);
        final[vocabId].lowest = positiveFacets.length > 0 ? Math.min(...positiveFacets) - 1 : undefined;
      });
    });
    
    return final;
  };

  if (isLessonComplete) {
    const finalVocabRankings = calculateFinalRankings();
    
    return (
      <EndOfLesson 
        lessonResults={lessonResults} 
        vocabDataMap={vocabDataMap}
        initialVocabRankings={initialVocabRankings.current || {}}
        finalVocabRankings={finalVocabRankings}
      />
    );
  }

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
        {hasCheckedAnswer && (
          <FeedbackOverlay 
            isCorrect={isQuestionCorrect}
            correctAnswer={currentQuestion.answer}
            questionType={currentQuestion.type}
            vocab={currentQuestion.vocab}
            vocabId={currentQuestion.id}
            api={api}
          />
        )}
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
