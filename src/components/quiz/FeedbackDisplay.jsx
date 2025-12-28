import './FeedbackDisplay.scss';
import { useState } from 'react';
import { VocabDisplay } from '@/components/quiz/VocabDisplay';

const MARKER_TYPES = {
  NEEDS_REVIEW: 'needs_review',
  FLAG_AS_ERROR: 'flag_as_error',
};

export function FeedbackDisplay({ isCorrect, correctAnswer, questionType, vocab, vocabId, api }) {
  const [isReviewDisabled, setIsReviewDisabled] = useState(false);
  const [isErrorDisabled, setIsErrorDisabled] = useState(false);
  const [isReviewChecked, setIsReviewChecked] = useState(false);
  const [isErrorChecked, setIsErrorChecked] = useState(false);

  const handleMarkReview = async () => {
    if (isReviewDisabled) return;
    if (!vocabId || !api) {
      console.warn('Cannot mark for review: missing vocabId or api', { vocabId, api });
      return;
    }
    
    setIsReviewChecked(true);
    setIsReviewDisabled(true);
    try {
      await api.postVocabMark(vocabId, MARKER_TYPES.NEEDS_REVIEW);
    } catch (error) {
      console.warn('Failed to mark vocab for review:', error);
      setIsReviewChecked(false);
      setIsReviewDisabled(false); // Re-enable on error
    }
  };

  const handleMarkError = async () => {
    if (isErrorDisabled) return;
    if (!vocabId || !api) {
      console.warn('Cannot mark as error: missing vocabId or api', { vocabId, api });
      return;
    }
    
    setIsErrorChecked(true);
    setIsErrorDisabled(true);
    try {
      await api.postVocabMark(vocabId, MARKER_TYPES.FLAG_AS_ERROR);
    } catch (error) {
      console.warn('Failed to mark vocab as error:', error);
      setIsErrorChecked(false);
      setIsErrorDisabled(false); // Re-enable on error
    }
  };

  const CircleIcon = ({ checked }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="circle-icon">
      {checked ? (
        <>
          <circle cx="12" cy="12" r="10" fill="white" stroke="white" strokeWidth="2"/>
          <path d="M7 12l3 3 7-7" stroke="rgba(0, 0, 0, 0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      ) : (
        <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
      )}
    </svg>
  );
  if (isCorrect) {
    // Extract word, reading, and meaning from vocab object
    const word = vocab?.word;
    const reading = vocab?.reading;
    const meaning = vocab?.definition && Array.isArray(vocab.definition) 
      ? vocab.definition.join(', ') 
      : vocab?.definition;
    
    const hasWord = word && word.trim();
    const hasReading = reading && reading.trim();
    const hasMeaning = meaning && meaning.trim();
    const hasAnyData = hasWord || hasReading || hasMeaning;
    
  return (
    <div className="feedback-display correct">
      <div className="feedback-content-wrapper">
        <div className="feedback-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
            <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {hasAnyData ? (
          <div className="feedback-content">
            <VocabDisplay word={word} reading={reading} meaning={meaning} />
          </div>
        ) : null}
        <button 
          className="feedback-action-button mark-review-button"
          onClick={handleMarkReview}
          disabled={isReviewDisabled}
        >
          <CircleIcon checked={isReviewChecked} />
          <span>Review</span>
        </button>
        <button 
          className="feedback-action-button mark-error-button"
          onClick={handleMarkError}
          disabled={isErrorDisabled}
        >
          <CircleIcon checked={isErrorChecked} />
          <span>Error</span>
        </button>
      </div>
    </div>
  );
  }

  // Extract word, reading, and meaning from vocab object for incorrect display
  const word = vocab?.word;
  const reading = vocab?.reading;
  const meaning = vocab?.definition && Array.isArray(vocab.definition) 
    ? vocab.definition.join(', ') 
    : vocab?.definition;
  
  const hasWord = word && word.trim();
  const hasReading = reading && reading.trim();
  const hasMeaning = meaning && meaning.trim();
  const hasAnyData = hasWord || hasReading || hasMeaning;

  return (
    <div className="feedback-display incorrect">
      <div className="feedback-content-wrapper">
        <div className="feedback-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#dc2626" strokeWidth="2"/>
            <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {hasAnyData ? (
          <div className="feedback-content">
            <VocabDisplay word={word} reading={reading} meaning={meaning} />
          </div>
        ) : null}
        <button 
          className="feedback-action-button mark-review-button"
          onClick={handleMarkReview}
          disabled={isReviewDisabled}
        >
          <CircleIcon checked={isReviewChecked} />
          <span>Review</span>
        </button>
        <button 
          className="feedback-action-button mark-error-button"
          onClick={handleMarkError}
          disabled={isErrorDisabled}
        >
          <CircleIcon checked={isErrorChecked} />
          <span>Error</span>
        </button>
      </div>
    </div>
  );
}
