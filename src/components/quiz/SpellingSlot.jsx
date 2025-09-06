import './SpellingSlot.scss';

export function SpellingSlot({ symbol, onClick }) {
  return (
    <button 
      className={`spelling-slot ${symbol ? 'filled' : 'empty'}`}
      onClick={onClick}
    >
      {symbol || ''}
    </button>
  );
}
