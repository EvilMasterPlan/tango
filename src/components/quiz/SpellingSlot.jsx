import './SpellingSlot.scss';

export function SpellingSlot({ symbol, onClick, hasCheckedAnswer = false, isCorrect = false, isIncorrect = false }) {
  return (
    <button 
      className={`spelling-slot ${symbol ? 'filled' : 'empty'} ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
      onClick={onClick}
      disabled={hasCheckedAnswer}
    >
      {symbol || ''}
    </button>
  );
}
